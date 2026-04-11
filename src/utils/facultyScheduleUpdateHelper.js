export const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

// Helper function to identify missing days

export const buildEditableSchedule = (weeklySchedule = []) => {
    return days.map((day) => {
        const foundDay = weeklySchedule.find((item) => item.day === day);

        return {
            day,
            classes: foundDay?.classes?.length ? foundDay.classes : [],
            freeSlots: foundDay?.freeSlots?.length ? foundDay.freeSlots : []
        };
    });
};

// Class change function

export const handleClassChange = (dayIndex, classIndex, field, value,setUpdateWeeklySchedule) => {
    setUpdateWeeklySchedule((prev) =>
        prev.map((dayItem, dIdx) =>
            dIdx === dayIndex
                ? {
                      ...dayItem,
                      classes: dayItem.classes.map((classItem, cIdx) =>
                          cIdx === classIndex
                              ? { ...classItem, [field]: value }
                              : classItem
                      )
                  }
                : dayItem
        )
    );
};

// Free slot change function

export const handleFreeSlotChange = (dayIndex, slotIndex, field, value,setUpdateWeeklySchedule) => {
    setUpdateWeeklySchedule((prev) =>
        prev.map((dayItem, dIdx) =>
            dIdx === dayIndex
                ? {
                      ...dayItem,
                      freeSlots: dayItem.freeSlots.map((slot, sIdx) =>
                          sIdx === slotIndex
                              ? { ...slot, [field]: value }
                              : slot
                      )
                  }
                : dayItem
        )
    );
};

// Class add function

export const handleAddClass = (dayIndex,setUpdateWeeklySchedule) => {
    setUpdateWeeklySchedule((prev) =>
        prev.map((dayItem, dIdx) =>
            dIdx === dayIndex
                ? {
                      ...dayItem,
                      classes: [
                          ...dayItem.classes,
                          { courseName: "", startTime: "", endTime: "" }
                      ]
                  }
                : dayItem
        )
    );
};

// Remove class function

export const handleRemoveClass = (dayIndex, classIndex,setUpdateWeeklySchedule) => {
    setUpdateWeeklySchedule((prev) =>
        prev.map((dayItem, dIdx) =>
            dIdx === dayIndex
                ? {
                      ...dayItem,
                      classes: dayItem.classes.filter((_, cIdx) => cIdx !== classIndex)
                  }
                : dayItem
        )
    );
};

// free slot add function

export const handleAddFreeSlot = (dayIndex, setUpdateWeeklySchedule) => {
    setUpdateWeeklySchedule((prev) =>
        prev.map((dayItem, dIdx) =>
            dIdx === dayIndex
                ? {
                      ...dayItem,
                      freeSlots: [
                          ...dayItem.freeSlots,
                          { startTime: "", endTime: "" }
                      ]
                  }
                : dayItem
        )
    );
};

// Remove free slot function

export const handleRemoveFreeSlot = (dayIndex, slotIndex,setUpdateWeeklySchedule) => {
    setUpdateWeeklySchedule((prev) =>
        prev.map((dayItem, dIdx) =>
            dIdx === dayIndex
                ? {
                      ...dayItem,
                      freeSlots: dayItem.freeSlots.filter((_, sIdx) => sIdx !== slotIndex)
                  }
                : dayItem
        )
    );
};






