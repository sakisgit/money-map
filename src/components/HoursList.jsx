
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";
import EditHoursEntryModal from "./EditHoursEntryModal";
import EditRestDayModal from "./EditRestDayModal";
import {
  getWorkHoursListLabel,
  formatEntryDisplayDate,
  formatDateKeyDisplay,
  isEntryInVisibleWorkMonths,
  isVacationDateAllowed,
} from "../utils/dateKey";
import { useToday } from "../hooks/useToday";
import Swal from "sweetalert2";
import {
  dateHasWorkHours,
  getPaidVacationEntryForDate,
  isPaidVacationEntry,
} from "../utils/workDayConflicts";

const STATUS_LABELS = {
  off: "Day off",
  vacation: "Vacation",
  paidVacation: "Paid vacation",
};

const isStatusEntryVisible = (dateKey, status, today) => {
  if (status === "vacation") return isVacationDateAllowed(dateKey, today);
  return isEntryInVisibleWorkMonths(dateKey, today);
};

const HoursList = () => {
  const {
    hoursList,
    setHoursList,
    setTotalHours,
    workDayStatus,
    setWorkDayStatus,
    formatMoney,
  } = useContext(AppContext);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const { today } = useToday();

  const listTitle = useMemo(() => getWorkHoursListLabel(today), [today]);

  const editingEntry =
    editingIndex !== null ? hoursList[editingIndex] ?? null : null;

  const visibleEntries = useMemo(() => {
    const shifts = hoursList
      .map((item, listIndex) => ({
        kind: "shift",
        item,
        listIndex,
        dateKey: item.dateKey || "",
        sortId: Number(item.id) || 0,
      }))
      .filter(
        ({ item }) =>
          isEntryInVisibleWorkMonths(item.dateKey, today) &&
          !isPaidVacationEntry(item)
      );

    const statuses = Object.entries(workDayStatus)
      .filter(([dateKey, status]) => {
        if (!status || !isStatusEntryVisible(dateKey, status, today)) return false;
        if (status === "vacation") return true;
        return !dateHasWorkHours(hoursList, dateKey);
      })
      .map(([dateKey, status]) => ({
        kind: "status",
        dateKey,
        status,
        sortId: 0,
      }));

    return [...shifts, ...statuses].sort((a, b) => {
      const byDate = (b.dateKey || "").localeCompare(a.dateKey || "");
      if (byDate !== 0) return byDate;
      if (a.kind !== b.kind) return a.kind === "shift" ? -1 : 1;
      return (b.sortId || 0) - (a.sortId || 0);
    });
  }, [hoursList, workDayStatus, today]);

  const handleClear = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Clear all entries shown for ${listTitle}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, clear",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const remaining = hoursList.filter(
          (item) => !isEntryInVisibleWorkMonths(item.dateKey, today)
        );
        const removedHours = hoursList
          .filter((item) => isEntryInVisibleWorkMonths(item.dateKey, today))
          .reduce((sum, item) => sum + (Number(item?.hours) || 0), 0);

        setHoursList(remaining);
        setTotalHours((prev) => Math.max(0, prev - removedHours));

        setWorkDayStatus((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((dateKey) => {
            const status = next[dateKey];
            if (isStatusEntryVisible(dateKey, status, today)) {
              delete next[dateKey];
            }
          });
          return next;
        });

        Swal.fire({
          icon: "success",
          title: "Cleared!",
          text: "Visible month entries have been removed.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDeleteShift = (listIndex) => {
    const hoursItem = hoursList[listIndex];
    if (!hoursItem) return;

    const newHoursList = hoursList.filter((_, i) => i !== listIndex);
    setHoursList(newHoursList);
    setTotalHours((prev) => prev - (Number(hoursItem.hours) || 0));
  };

  const handleDeleteStatus = (dateKey) => {
    const paidEntry = getPaidVacationEntryForDate(hoursList, dateKey);

    setWorkDayStatus((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });

    if (paidEntry) {
      setHoursList((prev) => prev.filter((item) => item.id !== paidEntry.id));
      setTotalHours((prev) => prev - (Number(paidEntry.hours) || 0));
    }
  };

  const handleUpdateStatus = ({ originalDateKey, dateKey, status }) => {
    setWorkDayStatus((prev) => {
      const next = { ...prev };
      if (originalDateKey !== dateKey) {
        delete next[originalDateKey];
      }
      next[dateKey] = status;
      return next;
    });
    setEditingStatus(null);

    Swal.fire({
      icon: "success",
      title: "Entry updated",
      timer: 1400,
      showConfirmButton: false,
    });
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
          <h6 className="text-muted fw-bold m-0">Work hours</h6>
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
          {visibleEntries.map((entry) => {
            if (entry.kind === "status") {
              const paidEntry = getPaidVacationEntryForDate(hoursList, entry.dateKey);
              const isPaid = Boolean(paidEntry);
              const paidHours = Number(paidEntry?.hours) || 0;
              const paidEarnings =
                paidHours * (Number(paidEntry?.rate) || 0);

              return (
                <li
                  key={`status-${entry.dateKey}`}
                  className={`hours-list-simple__row hours-list-simple__row--${entry.status}${
                    isPaid ? " hours-list-simple__row--paid-vacation" : ""
                  }`}
                >
                  <div className="hours-list-simple__content">
                    <span className="badge date-badge hours-list-simple__date">
                      {formatDateKeyDisplay(entry.dateKey)}
                    </span>

                    <div className="hours-list-simple__line">
                      <span
                        className={`hours-list-status-badge hours-list-status-badge--${entry.status}${
                          isPaid ? " hours-list-status-badge--paid" : ""
                        }`}
                      >
                        {entry.status === "off" ? (
                          <i className="fa-solid fa-mug-hot me-1" aria-hidden></i>
                        ) : (
                          <i
                            className="fa-solid fa-plane-departure me-1"
                            aria-hidden
                          ></i>
                        )}
                        {isPaid
                          ? STATUS_LABELS.paidVacation
                          : STATUS_LABELS[entry.status]}
                      </span>
                    </div>

                    {isPaid && (
                      <div className="hours-list-simple__line">
                        <span className="hours-list-simple__label">Paid:</span>{" "}
                        {paidHours.toFixed(2)} h
                        <span className="hours-list-simple__sep">·</span>
                        <span className="text-success fw-semibold">
                          €{formatMoney(paidEarnings)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="hours-list-actions">
                    <EditButton
                      onEdit={() =>
                        setEditingStatus({
                          dateKey: entry.dateKey,
                          status: entry.status,
                        })
                      }
                    />
                    <DeleteButton
                      onDelete={() => handleDeleteStatus(entry.dateKey)}
                    />
                  </div>
                </li>
              );
            }

            const { item: hoursItem, listIndex } = entry;
            const hours = Number(hoursItem.hours) || 0;
            const earnings = hours * (Number(hoursItem.rate) || 0);
            const hasTimes = hoursItem.startTime && hoursItem.endTime;

            return (
              <li
                key={hoursItem.id ?? `hours-list-${listIndex}`}
                className="hours-list-simple__row hours-list-simple__row--shift"
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
                  <DeleteButton onDelete={() => handleDeleteShift(listIndex)} />
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

      {editingStatus && (
        <EditRestDayModal
          key={`${editingStatus.dateKey}-${editingStatus.status}`}
          dateKey={editingStatus.dateKey}
          status={editingStatus.status}
          onClose={() => setEditingStatus(null)}
          onSave={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default HoursList;
