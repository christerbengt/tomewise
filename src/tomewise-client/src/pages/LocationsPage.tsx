import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLocations, createLocation, updateLocation, deleteLocation } from "../api/locations";
import type { Location } from "../types";
import { useTranslation } from "react-i18next";

const LocationsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [bookCase, setBookCase] = useState("");
  const [shelfNumber, setShelfNumber] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      resetForm();
    },
    onError: () => setError("This location already exists"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Location, "id" | "bookCount"> }) =>
      updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      resetForm();
    },
    onError: () => setError("A location with this bookcase and shelf number already exists"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
    onError: () => setError("Cannot delete a location that still has books on it"),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingLocation(null);
    setBookCase("");
    setShelfNumber("");
    setCustomCode("");
    setDescription("");
    setError(null);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setBookCase(location.bookCase);
    setShelfNumber(location.shelfNumber.toString());
    setCustomCode(location.customCode ?? "");
    setDescription(location.description ?? "");
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const data = {
      bookCase,
      shelfNumber: Number(shelfNumber),
      customCode: customCode || null,
      description: description || null,
    };
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="locations-page">
      <div className="page-header">
        <h2>{t("locations")}</h2>
        <button
          className="button-primary"
          onClick={() => showForm && !editingLocation ? resetForm() : setShowForm(true)}
        >
          {showForm && !editingLocation ? t("cancel") : t("addLocation")}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="location-form">
          <h3>{editingLocation ? t("editLocation") : t("newLocation")}</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bookCase">{t("bookcase")}</label>
              <input
                id="bookCase"
                type="text"
                value={bookCase}
                onChange={(e) => setBookCase(e.target.value)}
                placeholder={t("bookcasePlaceholder")}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="shelfNumber">{t("shelfNumber")}</label>
              <input
                id="shelfNumber"
                type="number"
                value={shelfNumber}
                onChange={(e) => setShelfNumber(e.target.value)}
                placeholder={t("shelfPlaceholder")}
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="customCode">{t("customCode")}</label>
            <input
              id="customCode"
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder={t("customCodePlaceholder")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">{t("locationDescription")}</label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("locationDescriptionPlaceholder")}
            />
          </div>
          <div className="form-row">
            <button type="submit" className="button-primary" disabled={isPending}>
              {isPending ? t("saving") : editingLocation ? t("saveChanges") : t("saveLocation")}
            </button>
            <button type="button" className="button-secondary" onClick={resetForm}>
              {t("cancel")}
            </button>
          </div>
        </form>
      )}

      {locations.length === 0 ? (
        <div className="empty-state">
          <p>{t("noLocations")}</p>
        </div>
      ) : (
        <div className="location-list">
          {locations.map((location) => (
            <div key={location.id} className="location-card">
              <div className="location-info">
                <span className="location-code">
                  {location.customCode ?? `${location.bookCase}${location.shelfNumber}`}
                </span>
                {location.description && (
                  <span className="location-description">{location.description}</span>
                )}
              </div>
              <div className="location-actions">
                <span className="book-count">{location.bookCount} {t("books")}</span>
                <button className="button-secondary" onClick={() => handleEdit(location)}>
                  {t("edit")}
                </button>
                <button
                  className="button-danger"
                  onClick={() => deleteMutation.mutate(location.id)}
                  disabled={location.bookCount > 0}
                  title={location.bookCount > 0 ? "Move all books to another location first" : "Delete location"}
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationsPage;