// app/classes/page.tsx
"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

import { useFetchClasses } from "@/hooks/useFetchClasses";
import {
  createClass,
  updateClass,
  deleteClass,
  updateAttendance,
  // Nuevo: un servicio para asignar profesor
  assignTeacherToClass,
} from "@/services/classService";

import { Button } from "@/components/ui/button";
import { ClassFormDialog } from "@/components/classes/ClassFormDialog";
import { AttendanceDialog } from "@/components/classes/AttendanceDialog";
import { GenerateClassesDialog } from "@/components/classes/GenerateClassesDialog";

import { ClassSession } from "@/types";
import { ClassesList } from "@/components/classes/ClassesList";
import { BulkActionsBar } from "@/components/classes/BulkActionsBar";

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const filterMonth = searchParams.get("month") || "";
  const filterYear = searchParams.get("year") || "";

  const { classes, loading, refetch } = useFetchClasses(filterMonth, filterYear);

  // ESTADO: para asignar profesor
  // (puede que quieras un modal, tipo "AssignTeacherDialog", 
  //  pero aquí lo haremos simple)

  // ESTADO: Para los diálogos de crear/editar, asistencia y generar:
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // ESTADO: IDs de las clases seleccionadas en la tabla (multi-selección)
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  // ------------------------------------------------
  // HANDLERS: crear / editar
  // ------------------------------------------------
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassDialogOpen(true);
  };

  const handleOpenEditClass = (cls: ClassSession) => {
    setEditingClass(cls);
    setClassDialogOpen(true);
  };

  const handleSaveClass = async (payload: Partial<ClassSession>) => {
    try {
      if (editingClass) {
        await updateClass(editingClass._id, payload);
        alert("Clase actualizada correctamente.");
      } else {
        await createClass(payload);
        alert("Clase creada correctamente.");
      }
      refetch();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar la clase.");
    }
  };

  // ------------------------------------------------
  // HANDLERS: eliminar (individual)
  // ------------------------------------------------
  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("¿Seguro de eliminar esta clase?")) return;
    try {
      await deleteClass(classId);
      alert("Clase eliminada correctamente.");
      refetch();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al eliminar la clase.");
    }
  };

  // ------------------------------------------------
  // HANDLERS: asistencia (individual)
  // ------------------------------------------------
  const handleOpenAttendance = (cls: ClassSession) => {
    setSelectedClass(cls);
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = async (attendanceData: any) => {
    if (!selectedClass) return;
    try {
      await updateAttendance(selectedClass._id, attendanceData);
      alert("Asistencia registrada/actualizada.");
      refetch();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la asistencia.");
    }
  };

  // ------------------------------------------------
  // HANDLERS: generar clases por schedule
  // ------------------------------------------------
  const handleOpenGenerateDialog = () => {
    setGenerateDialogOpen(true);
  };

  // ------------------------------------------------
  // HANDLERS: selección múltiple
  // ------------------------------------------------
  /**
   * Cuando el usuario marca/desmarca una clase en la tabla
   */
  const handleToggleSelectClass = (classId: string) => {
    setSelectedClassIds((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  /**
   * Marca o desmarca TODAS las clases
   */
  const handleToggleSelectAll = (allClassIds: string[]) => {
    // Si YA están todas seleccionadas, las deseleccionamos
    // de lo contrario, las seleccionamos
    const allSelected = allClassIds.every((id) => selectedClassIds.includes(id));
    if (allSelected) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(allClassIds);
    }
  };

  // ------------------------------------------------
  // HANDLERS: acciones en bloque
  // ------------------------------------------------
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Vas a eliminar ${selectedClassIds.length} clases. ¿Continuar?`
      )
    )
      return;
    try {
      // Podrías tener un endpoint masivo, 
      // pero aquí haremos un loop (simple)
      for (const classId of selectedClassIds) {
        await deleteClass(classId);
      }
      alert(`${selectedClassIds.length} clase(s) eliminadas`);
      setSelectedClassIds([]);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al eliminar en lote.");
    }
  };

  const handleBulkAssignTeacher = async (teacherId: string) => {
    try {
      for (const classId of selectedClassIds) {
        await assignTeacherToClass(classId, teacherId);
      }
      alert(`Profesor asignado a ${selectedClassIds.length} clase(s).`);
      setSelectedClassIds([]);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al asignar el profesor en lote.");
    }
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold">Gestión de Clases</h1>
        <Button variant="outline" onClick={handleOpenGenerateDialog}>
          Generar Clases por Schedule
        </Button>
        <Button onClick={handleOpenCreateClass}>Crear Clase</Button>
      </div>

      {/* Acciones en bloque, si hay clases seleccionadas */}
      {selectedClassIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedClassIds.length}
          onBulkDelete={handleBulkDelete}
          onBulkAssignTeacher={handleBulkAssignTeacher}
        />
      )}

      {loading ? (
        <p>Cargando clases...</p>
      ) : classes.length === 0 ? (
        <p>No hay clases registradas.</p>
      ) : (
        <ClassesList
          classes={classes}
          selectedClassIds={selectedClassIds}
          onToggleSelectClass={handleToggleSelectClass}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenAttendance={handleOpenAttendance}
          onEditClass={handleOpenEditClass}
          onDeleteClass={handleDeleteClass}
        />
      )}

      {/* Diálogos */}
      <ClassFormDialog
        open={classDialogOpen}
        onClose={() => setClassDialogOpen(false)}
        initialData={editingClass}
        onSubmit={handleSaveClass}
      />

      <AttendanceDialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        classData={selectedClass ?? undefined}
        onSave={handleSaveAttendance}
      />

      <GenerateClassesDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}