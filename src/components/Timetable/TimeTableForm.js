import React, { useState, useEffect } from "react";
import { XMarkIcon, ClockIcon, CalendarIcon } from "@heroicons/react/24/outline";

const TimetableForm = ({
  onAddTimetable,
  onUpdateTimetable,
  existingTimetable,
  onClose
}) => {
  const [name, setName] = useState("");
  const [shiftType, setShiftType] = useState("single");
  const [checkInStart, setCheckInStart] = useState("");
  const [checkInEnd, setCheckInEnd] = useState("");
  const [checkOutStart, setCheckOutStart] = useState("");
  const [checkOutEnd, setCheckOutEnd] = useState("");
  const [shift2CheckInStart, setShift2CheckInStart] = useState("");
  const [shift2CheckInEnd, setShift2CheckInEnd] = useState("");
  const [shift2CheckOutStart, setShift2CheckOutStart] = useState("");
  const [shift2CheckOutEnd, setShift2CheckOutEnd] = useState("");
  const [shift2LateAllowance, setShift2LateAllowance] = useState(30);
  const [shift2EarlyLeaveAllowance, setShift2EarlyLeaveAllowance] = useState(30);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [lateAllowance, setLateAllowance] = useState(30);
  const [earlyLeaveAllowance, setEarlyLeaveAllowance] = useState(30);
  const [workingDays, setWorkingDays] = useState([]);
  const [activeTab, setActiveTab] = useState("schedule");

  const daysOfWeek = [
    { name: "Sunday", value: "Sunday" },
    { name: "Monday", value: "Monday" },
    { name: "Tuesday", value: "Tuesday" },
    { name: "Wednesday", value: "Wednesday" },
    { name: "Thursday", value: "Thursday" },
    { name: "Friday", value: "Friday" },
    { name: "Saturday", value: "Saturday" }
  ];

  useEffect(() => {
    if (existingTimetable) {
      setName(existingTimetable.name || "");
      setShiftType(existingTimetable.shiftType || "single");
      setCheckInStart(existingTimetable.checkInStart || "");
      setCheckInEnd(existingTimetable.checkInEnd || "");
      setCheckOutStart(existingTimetable.checkOutStart || "");
      setCheckOutEnd(existingTimetable.checkOutEnd || "");
      setShift2CheckInStart(existingTimetable.shift2CheckInStart || "");
      setShift2CheckInEnd(existingTimetable.shift2CheckInEnd || "");
      setShift2CheckOutStart(existingTimetable.shift2CheckOutStart || "");
      setShift2CheckOutEnd(existingTimetable.shift2CheckOutEnd || "");
      setShift2LateAllowance(existingTimetable.shift2LateAllowance || 30);
      setShift2EarlyLeaveAllowance(existingTimetable.shift2EarlyLeaveAllowance || 30);
      setWeeklySchedule(existingTimetable.weeklySchedule || {});
      setLateAllowance(existingTimetable.lateAllowance || 30);
      setEarlyLeaveAllowance(existingTimetable.earlyLeaveAllowance || 30);
      const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const safeDays = (existingTimetable.workingDays || []).filter(day =>
        typeof day === "string" && validDays.includes(day)
      );
      setWorkingDays(safeDays);
    }
  }, [existingTimetable]);

  const handleWorkingDaysChange = (value) => {
    setWorkingDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleNumberChange = (setter) => (e) => {
    setter(Number(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTimetable = {
      name,
      shiftType,
      checkInStart,
      checkInEnd,
      checkOutStart,
      checkOutEnd,
      lateAllowance,
      earlyLeaveAllowance,
      workingDays
    };

    if (shiftType === "split") {
      newTimetable.shift2CheckInStart = shift2CheckInStart;
      newTimetable.shift2CheckInEnd = shift2CheckInEnd;
      newTimetable.shift2CheckOutStart = shift2CheckOutStart;
      newTimetable.shift2CheckOutEnd = shift2CheckOutEnd;
      newTimetable.shift2LateAllowance = shift2LateAllowance;
      newTimetable.shift2EarlyLeaveAllowance = shift2EarlyLeaveAllowance;
    }

    if (shiftType === "weekly") {
      newTimetable.weeklySchedule = weeklySchedule;
    }

    if (existingTimetable) {
      newTimetable._id = existingTimetable._id;
      onUpdateTimetable(newTimetable);
    } else {
      onAddTimetable(newTimetable);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <ClockIcon className="w-6 h-6 mr-2 text-primary" />
            {existingTimetable ? "Edit Timetable" : "Create New Timetable"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-4rem)]">
          <form onSubmit={handleSubmit}>
            {/* Timetable Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timetable Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter timetable name"
                required
              />
            </div>

            {/* Shift Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shift Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["single", "split", "weekly"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setShiftType(type)}
                    className={`px-4 py-3 rounded-lg border ${
                      shiftType === type
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650"
                    } transition-colors flex items-center justify-center`}
                  >
                    <span className="capitalize font-medium">{type} Shift</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs for Schedule and Settings */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className={`py-3 px-1 font-medium text-sm border-b-2 ${
                    activeTab === "schedule"
                      ? "border-primary text-primary dark:text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`py-3 px-1 font-medium text-sm border-b-2 ${
                    activeTab === "settings"
                      ? "border-primary text-primary dark:text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Schedule Tab Content */}
            {activeTab === "schedule" && (
              <>
                {/* Single Shift Fields */}
                {shiftType === "single" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1 text-primary" />
                        Check-In Time
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={checkInStart}
                            onChange={(e) => setCheckInStart(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={checkInEnd}
                            onChange={(e) => setCheckInEnd(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Late Allowance (minutes)
                          </label>
                          <input
                            type="number"
                            value={lateAllowance}
                            onChange={handleNumberChange(setLateAllowance)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1 text-primary" />
                        Check-Out Time
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={checkOutStart}
                            onChange={(e) => setCheckOutStart(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={checkOutEnd}
                            onChange={(e) => setCheckOutEnd(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Early Leave Allowance (minutes)
                          </label>
                          <input
                            type="number"
                            value={earlyLeaveAllowance}
                            onChange={handleNumberChange(setEarlyLeaveAllowance)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Split Shift Fields */}
                {shiftType === "split" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Shift</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Check-In</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={checkInStart}
                              onChange={(e) => setCheckInStart(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={checkInEnd}
                              onChange={(e) => setCheckInEnd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Late Allowance (minutes)
                            </label>
                            <input
                              type="number"
                              value={lateAllowance}
                              onChange={handleNumberChange(setLateAllowance)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Check-Out</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={checkOutStart}
                              onChange={(e) => setCheckOutStart(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={checkOutEnd}
                              onChange={(e) => setCheckOutEnd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Early Leave Allowance (minutes)
                            </label>
                            <input
                              type="number"
                              value={earlyLeaveAllowance}
                              onChange={handleNumberChange(setEarlyLeaveAllowance)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6">Second Shift</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Check-In</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={shift2CheckInStart}
                              onChange={(e) => setShift2CheckInStart(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={shift2CheckInEnd}
                              onChange={(e) => setShift2CheckInEnd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Late Allowance (minutes)
                            </label>
                            <input
                              type="number"
                              value={shift2LateAllowance}
                              onChange={handleNumberChange(setShift2LateAllowance)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Check-Out</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={shift2CheckOutStart}
                              onChange={(e) => setShift2CheckOutStart(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={shift2CheckOutEnd}
                              onChange={(e) => setShift2CheckOutEnd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Early Leave Allowance (minutes)
                            </label>
                            <input
                              type="number"
                              value={shift2EarlyLeaveAllowance}
                              onChange={handleNumberChange(setShift2EarlyLeaveAllowance)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Fields */}
                {shiftType === "weekly" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Weekly Schedule:</label>
                    {daysOfWeek.map(({ name }) => (
                      <div key={name} className="grid grid-cols-4 gap-2 mb-2 items-center">
                        <label className="flex items-center col-span-1">
                          <input
                            type="checkbox"
                            checked={workingDays.includes(name)}
                            onChange={() => handleWorkingDaysChange(name)}
                            className="mr-2"
                          />
                          {name}
                        </label>
                        <input
                          type="time"
                          value={weeklySchedule[name]?.checkIn || ""}
                          onChange={(e) =>
                            setWeeklySchedule(prev => ({
                              ...prev,
                              [name]: {
                                ...prev[name],
                                checkIn: e.target.value
                              }
                            }))
                          }
                          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <input
                          type="time"
                          value={weeklySchedule[name]?.checkOut || ""}
                          onChange={(e) =>
                            setWeeklySchedule(prev => ({
                              ...prev,
                              [name]: {
                                ...prev[name],
                                checkOut: e.target.value
                              }
                            }))
                          }
                          className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium">Late Allowance (minutes):</label>
                        <input
                          type="number"
                          value={lateAllowance}
                          onChange={handleNumberChange(setLateAllowance)}
                          className="w-full mt-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Early Leave Allowance (minutes):</label>
                        <input
                          type="number"
                          value={earlyLeaveAllowance}
                          onChange={handleNumberChange(setEarlyLeaveAllowance)}
                          className="w-full mt-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Working Days - Show only if NOT Weekly */}
                {shiftType !== "weekly" && (
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
                  </div>
                )}
              </>
            )}

            {/* Settings Tab Content */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1 text-primary" />
                    Check-In Time
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={checkInStart}
                        onChange={(e) => setCheckInStart(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={checkInEnd}
                        onChange={(e) => setCheckInEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Late Allowance (minutes)
                      </label>
                      <input
                        type="number"
                        value={lateAllowance}
                        onChange={handleNumberChange(setLateAllowance)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1 text-primary" />
                    Check-Out Time
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={checkOutStart}
                        onChange={(e) => setCheckOutStart(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={checkOutEnd}
                        onChange={(e) => setCheckOutEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Early Leave Allowance (minutes)
                      </label>
                      <input
                        type="number"
                        value={earlyLeaveAllowance}
                        onChange={handleNumberChange(setEarlyLeaveAllowance)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-primary" />
                    Working Days
                  </h3>
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
                </div>
              </div>
            )}

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
    </div>
  );
};

export default TimetableForm;
