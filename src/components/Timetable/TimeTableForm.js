import React, { useState, useEffect } from "react";
const baseURL = process.env.REACT_APP_API_BASE;

const TimetableForm = ({
  onAddTimetable,
  onUpdateTimetable,
  existingTimetable,
  onClose
}) => {
  const [name, setName] = useState("");
  const [checkInStart, setCheckInStart] = useState("");
  const [checkInEnd, setCheckInEnd] = useState("");
  const [checkOutStart, setCheckOutStart] = useState("");
  const [checkOutEnd, setCheckOutEnd] = useState("");
  const [lateAllowance, setLateAllowance] = useState(30);
  const [earlyLeaveAllowance, setEarlyLeaveAllowance] = useState(30);
  const [workingDays, setWorkingDays] = useState([]);
  const [holidayDates, setHolidayDates] = useState([]);

  const daysOfWeek = [
    { name: "Sunday", value: 0 },
    { name: "Monday", value: 1 },
    { name: "Tuesday", value: 2 },
    { name: "Wednesday", value: 3 },
    { name: "Thursday", value: 4 },
    { name: "Friday", value: 5 },
    { name: "Saturday", value: 6 },
  ];

  useEffect(() => {
    if (existingTimetable) {
      setName(existingTimetable.name || "");
      setCheckInStart(existingTimetable.checkInStart || "");
      setCheckInEnd(existingTimetable.checkInEnd || "");
      setCheckOutStart(existingTimetable.checkOutStart || "");
      setCheckOutEnd(existingTimetable.checkOutEnd || "");
      setLateAllowance(existingTimetable.lateAllowance || 30);
      setEarlyLeaveAllowance(existingTimetable.earlyLeaveAllowance || 30);
      setWorkingDays(existingTimetable.workingDays || []);
      setHolidayDates(existingTimetable.holidayDates || []);
    }
  }, [existingTimetable]);

  const handleWorkingDaysChange = (value) => {
    setWorkingDays((prev) =>
      prev.includes(value)
        ? prev.filter((d) => d !== value)
        : [...prev, value]
    );
  };

  const handleHolidayChange = (e) => {
    setHolidayDates([e.target.value]); // Single holiday for now
  };

  const handleNumberChange = (setter) => (e) => {
    setter(Number(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTimetable = {
      name,
      checkInStart,
      checkInEnd,
      checkOutStart,
      checkOutEnd,
      lateAllowance,
      earlyLeaveAllowance,
      workingDays,
      holidayDates,
    };

    if (existingTimetable) {
      newTimetable._id = existingTimetable._id;
      onUpdateTimetable(newTimetable);
    } else {
      onAddTimetable(newTimetable);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {existingTimetable ? "Edit Timetable" : "Create Timetable"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div>
            <label className="block text-sm font-medium">Timetable Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />

            <label className="block text-sm font-medium mt-3">Check-In Start:</label>
            <input
              type="time"
              value={checkInStart}
              onChange={(e) => setCheckInStart(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />

            <label className="block text-sm font-medium mt-3">Check-In End:</label>
            <input
              type="time"
              value={checkInEnd}
              onChange={(e) => setCheckInEnd(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />

            <label className="block text-sm font-medium mt-3">Late Allowance (minutes):</label>
            <input
              type="number"
              value={lateAllowance}
              onChange={handleNumberChange(setLateAllowance)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Right Column */}
          <div>
            <label className="block text-sm font-medium">Check-Out Start:</label>
            <input
              type="time"
              value={checkOutStart}
              onChange={(e) => setCheckOutStart(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />

            <label className="block text-sm font-medium mt-3">Check-Out End:</label>
            <input
              type="time"
              value={checkOutEnd}
              onChange={(e) => setCheckOutEnd(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />

            <label className="block text-sm font-medium mt-3">Early Leave Allowance (minutes):</label>
            <input
              type="number"
              value={earlyLeaveAllowance}
              onChange={handleNumberChange(setEarlyLeaveAllowance)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* Bottom Section */}
          <div className="col-span-2">
            <label className="block text-sm font-medium">Working Days:</label>
            <div className="grid grid-cols-3 gap-2">
              {daysOfWeek.map(({ name, value }) => (
                <label key={value} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600"
                    checked={workingDays.includes(value)}
                    onChange={() => handleWorkingDaysChange(value)}
                  />
                  <span className="ml-2">{name}</span>
                </label>
              ))}
            </div>

            <label className="block text-sm font-medium mt-3">Holiday Date:</label>
            <input
              type="date"
              value={holidayDates[0] || ""}
              onChange={handleHolidayChange}
              className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="col-span-2 flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#209ACF] hover:bg-[#209ACF] text-white py-2 px-4 rounded"
            >
              Save Timetable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimetableForm;
