// frontend/src/pages/Admin/OfficerManagement.jsx

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const OFFICES = [
  "HOA",
  "Healthcare Office",
  "Grievance Office",
  "Senior Citizen Office",
  "Parish Office",
];

const POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Officer",
];

function AdminAnnouncements() {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedResident, setSelectedResident] =
    useState(null);

  const [office, setOffice] = useState("");
  const [position, setPosition] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load all residents
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);

        const usersSnapshot = await getDocs(
          collection(db, "users")
        );

        const residentUsers = usersSnapshot.docs
          .map((userDoc) => ({
            uid: userDoc.id,
            ...userDoc.data(),
          }))
          .filter(
            (user) =>
              user.role === "resident"
          );

        const residentsWithOfficerStatus =
          await Promise.all(
            residentUsers.map(
              async (resident) => {
                const officerRef = doc(
                  db,
                  "officerProfiles",
                  resident.uid
                );

                const officerSnap =
                  await getDoc(officerRef);

                return {
                  ...resident,

                  officerProfile:
                    officerSnap.exists()
                      ? officerSnap.data()
                      : null,
                };
              }
            )
          );

        setResidents(
          residentsWithOfficerStatus
        );

      } catch (error) {
        console.error(
          "Error loading residents:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  const filteredResidents =
    residents.filter((resident) => {
      const search =
        searchTerm.toLowerCase();

      return (
        resident.email
          ?.toLowerCase()
          .includes(search) ||
        resident.uid
          ?.toLowerCase()
          .includes(search)
      );
    });

  const handleAssignOfficer = async () => {
    if (
      !selectedResident ||
      !office ||
      !position
    ) {
      setMessage(
        "Please select an office and position."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await setDoc(
        doc(
          db,
          "officerProfiles",
          selectedResident.uid
        ),
        {
          office,
          position,
          status: "active",
          assignedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setMessage(
        "Officer position assigned successfully."
      );

      setResidents((prev) =>
        prev.map((resident) =>
          resident.uid ===
          selectedResident.uid
            ? {
                ...resident,

                officerProfile: {
                  office,
                  position,
                  status: "active",
                },
              }
            : resident
        )
      );

      setSelectedResident(null);
      setOffice("");
      setPosition("");

    } catch (error) {
      console.error(
        "Error assigning officer:",
        error
      );

      setMessage(
        "Failed to assign officer position."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-2">
        Officer Management
      </h1>

      <p className="text-gray-500 mb-6">
        Assign officer positions to existing residents.
      </p>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-gray-100">
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Search resident by email or UID..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        className="w-full border rounded-lg p-3 mb-6"
      />

      {loading ? (
        <p>Loading residents...</p>
      ) : (
        <div className="space-y-3">

          {filteredResidents.map(
            (resident) => (
              <div
                key={resident.uid}
                className="border rounded-xl p-4 flex items-center justify-between"
              >

                <div>
                  <p className="font-semibold">
                    {resident.email}
                  </p>

                  <p className="text-xs text-gray-500">
                    UID: {resident.uid}
                  </p>

                  {resident.officerProfile && (
                    <p className="text-sm text-green-600 mt-1">
                      {resident.officerProfile.office}
                      {" — "}
                      {resident.officerProfile.position}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedResident(
                      resident
                    );

                    setOffice(
                      resident
                        .officerProfile
                        ?.office || ""
                    );

                    setPosition(
                      resident
                        .officerProfile
                        ?.position || ""
                    );
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  {resident.officerProfile
                    ? "Edit Officer"
                    : "Assign Officer"}
                </button>

              </div>
            )
          )}

        </div>
      )}

      {selectedResident && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Assign Officer Position
            </h2>

            <p className="text-sm text-gray-500 mb-4">
              {selectedResident.email}
            </p>

            <label className="block text-sm font-medium mb-1">
              Office
            </label>

            <select
              value={office}
              onChange={(e) =>
                setOffice(e.target.value)
              }
              className="w-full border rounded-lg p-3 mb-4"
            >
              <option value="">
                Select office
              </option>

              {OFFICES.map(
                (officeName) => (
                  <option
                    key={officeName}
                    value={officeName}
                  >
                    {officeName}
                  </option>
                )
              )}
            </select>

            <label className="block text-sm font-medium mb-1">
              Position
            </label>

            <select
              value={position}
              onChange={(e) =>
                setPosition(e.target.value)
              }
              className="w-full border rounded-lg p-3 mb-6"
            >
              <option value="">
                Select position
              </option>

              {POSITIONS.map(
                (positionName) => (
                  <option
                    key={positionName}
                    value={positionName}
                  >
                    {positionName}
                  </option>
                )
              )}
            </select>

            <div className="flex gap-3">

              <button
                onClick={() => {
                  setSelectedResident(
                    null
                  );

                  setOffice("");
                  setPosition("");
                }}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleAssignOfficer
                }
                disabled={saving}
                className="flex-1 bg-primary text-white rounded-lg py-2"
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminAnnouncements;