
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";
import EditHoursEntryModal from "./EditHoursEntryModal";
import {
  getWorkHoursListLabel,
  formatEntryDisplayDate,
  isEntryInVisibleWorkMonths,
} from "../utils/dateKey";
import Swal from "sweetalert2";

const HoursList = () => {
  const { hoursList, setHoursList, setTotalHours, formatMoney } =
    useContext(AppContext);
  const [editingIndex, setEditingIndex] = useState(null);

  const listTitle = useMemo(() => getWorkHoursListLabel(), []);

  const editingEntry =
    editingIndex !== null ? hoursList[editingIndex] ?? null : null;

  const visibleEntries = useMemo(
    () =>
      hoursList
        .map((item, listIndex) => ({ item, listIndex }))
        .filter(({ item }) => isEntryInVisibleWorkMonths(item.dateKey))
        .sort((a, b) => {
          const byDate = (b.item.dateKey || "").localeCompare(
            a.item.dateKey || ""
          );
          if (byDate !== 0) return byDate;

          const idA = Number(a.item.id) || 0;
          const idB = Number(b.item.id) || 0;
          return idB - idA;
        }),
    [hoursList]
  );

  const handleClear = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Clear all hours shown for ${listTitle}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, clear",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const remaining = hoursList.filter(
          (item) => !isEntryInVisibleWorkMonths(item.dateKey)
        );
        const removedHours = hoursList
          .filter((item) => isEntryInVisibleWorkMonths(item.dateKey))
          .reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);

        setHoursList(remaining);
        setTotalHours((prev) => Math.max(0, prev - removedHours));

        Swal.fire({
          icon: "success",
          title: "Cleared!",
          text: "Visible month hours have been removed.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDelete = (listIndex) => {
    const hoursItem = hoursList[listIndex];
    if (!hoursItem) return;

    const newHoursList = hoursList.filter((_, i) => i !== listIndex);
    setHoursList(newHoursList);
    setTotalHours((prev) => prev - (Number(hoursItem.hours) || 0));
  };

  const handleUpdate = (listIndex, updatedEntry) => {
    setHoursList((prev) =>
      prev.map((item, i) => (i === listIndex ? updatedEntry : item))
    );
    setEditingIndex(null);

    Swal.fire({
      icon: "success",
      title: "Shift updated",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  if (visibleEntries.length === 0) return null;

  return (
    <div className="card shadow-sm border-0 rounded-3 p-3 mt-4 hours-list-simple">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h6 className="text-muted fw-bold m-0">Worked Hours</h6>
          <small className="text-muted">{listTitle}</small>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-primary btn-sm text-white fw-bold py-2 px-3"
        >
          <i className="fa-solid fa-trash me-1" aria-hidden></i>
          Clear list
        </button>
      </div>

      <div className="hours-list-scroll">
        <ul className="hours-list-simple__list">
          {visibleEntries.map(({ item: hoursItem, listIndex }) => {
            const hours = Number(hoursItem.hours) || 0;
            const earnings = hours * (Number(hoursItem.rate) || 0);
            const hasTimes = hoursItem.startTime && hoursItem.endTime;

            return (
              <li
                key={hoursItem.id ?? `hours-list-${listIndex}`}
                className="hours-list-simple__row"
              >
                <div className="hours-list-simple__content">
                  <span className="badge date-badge hours-list-simple__date">
                    {formatEntryDisplayDate(hoursItem)}
                  </span>

                  {hasTimes && (
                    <div className="hours-list-simple__line">
                      <span className="hours-list-simple__label">Time:</span>{" "}
                      {hoursItem.startTime} – {hoursItem.endTime}
                    </div>
                  )}

                  <div className="hours-list-simple__line">
                    <span className="hours-list-simple__label">Hours:</span>{" "}
                    {hours.toFixed(2)} h
                    <span className="hours-list-simple__sep">·</span>
                    <span className="hours-list-simple__label">Pay:</span>{" "}
                    <span className="text-success fw-semibold">
                      €{formatMoney(earnings)}
                    </span>
                  </div>
                </div>

                <div className="hours-list-actions">
                  <EditButton onEdit={() => setEditingIndex(listIndex)} />
                  <DeleteButton onDelete={() => handleDelete(listIndex)} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {editingEntry && (
        <EditHoursEntryModal
          key={editingEntry.id}
          entry={editingEntry}
          onClose={() => setEditingIndex(null)}
          onSave={(updated) => handleUpdate(editingIndex, updated)}
        />
      )}
    </div>
  );
};

export default HoursList;
