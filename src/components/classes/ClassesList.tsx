import React from "react";
import { ClassSession } from "@/types";
import { Button } from "@/components/ui/button";
import { groupClassesByMonth } from "@/utils/groupClassesByMonth";
import { getDayName } from "@/utils/getDayName";

type Props = {
  classes: ClassSession[];
  selectedClassIds: string[];
  onToggleSelectClass: (classId: string) => void;
  onToggleSelectAll: (allClassIds: string[]) => void;
  onOpenAttendance: (cls: ClassSession) => void;
  onEditClass: (cls: ClassSession) => void;
  onDeleteClass: (classId: string) => void;
};

export function ClassesList({
  classes,
  selectedClassIds,
  onToggleSelectClass,
  onToggleSelectAll,
  onOpenAttendance,
  onEditClass,
  onDeleteClass,
}: Props) {
  const grouped = groupClassesByMonth(classes);

  return (
    <>
      {Object.keys(grouped)
        .sort()
        .map((monthKey) => {
          const [year, month] = monthKey.split("-").map(Number);
          const classesInMonth = grouped[monthKey];
          const thisMonthIds = classesInMonth.map((c) => c._id);
          const allSelected = thisMonthIds.every((id) =>
            selectedClassIds.includes(id)
          );

          return (
            <div key={monthKey} className="mb-8">
              <h2 className="text-lg font-semibold mb-2">
                {`Mes: ${month}/${year}`}
              </h2>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll(thisMonthIds)}
                />
                <span className="ml-2 text-sm">
                  Seleccionar/Deseleccionar todas las clases de {monthKey}
                </span>
              </div>

              <table className="w-full bg-white border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Seleccion</th>
                    <th className="px-4 py-2 text-left">Día</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Horario</th>
                    <th className="px-4 py-2 text-left">Profesor(es)</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {classesInMonth.map((cls) => {
                    const checked = selectedClassIds.includes(cls._id);
                    const dayName = getDayName(cls.day, cls.month, cls.year);
                    const dateStr = `${cls.day}/${cls.month}/${cls.year}`;
                    const timeStr = cls.startTime
                      ? `${cls.startTime} - ${cls.endTime}`
                      : "Sin horario";
                    const teachersStr = cls.teachers
                      .map((teacher) => teacher.username)
                      .join(", ");

                    return (
                      <tr key={cls._id} className="border-b border-gray-200">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleSelectClass(cls._id)}
                          />
                        </td>
                        <td className="px-4 py-2 capitalize">{dayName}</td>
                        <td className="px-4 py-2">{dateStr}</td>
                        <td className="px-4 py-2">{timeStr}</td>
                        <td className="px-4 py-2">{teachersStr || "Sin profesor"}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenAttendance(cls)}
                          >
                            Asistencia
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditClass(cls)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteClass(cls._id)}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
    </>
  );
}
