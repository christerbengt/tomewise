import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../api/locations";
import type { Location } from "../types";
import { useTranslation } from "react-i18next";
import { generateBookcaseSequence } from "../utils/bookcaseGenerator";

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

  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [bulkShelves, setBulkShelves] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const bulkPreview =
    bulkFrom && bulkTo ? generateBookcaseSequence(bulkFrom, bulkTo) : [];

  const handleBulkCreate = async () => {
    setBulkError(null);
    const shelves = Number(bulkShelves);

    if (bulkPreview.length === 0) {
      setBulkError("Invalid bookcase range");
      return;
    }
    if (!shelves || shelves < 1 || shelves > 20) {
      setBulkError("Shelves per bookcase must be between 1 and 20");
      return;
    }

    setIsBulkSaving(true);
    try {
      for (const bookCase of bulkPreview) {
        for (let shelf = 1; shelf <= shelves; shelf++) {
          await createLocation({
            bookCase,
            shelfNumber: shelf,
            customCode: null,
            description: null,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowBulkForm(false);
      setBulkFrom("");
      setBulkTo("");
      setBulkShelves("");
    } catch {
      setBulkError("Failed to create some locations");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      resetForm();
    },
    onError: () => setError("This location already exists"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<Location, "id" | "bookCount">;
    }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      resetForm();
    },
    onError: () =>
      setError("A location with this bookcase and shelf number already exists"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
    onError: () =>
      setError("Cannot delete a location that still has books on it"),
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
        <div className="header-actions">
          <button
            className="button-secondary"
            onClick={() => {
              setShowBulkForm(!showBulkForm);
              setShowForm(false);
            }}
          >
            {showBulkForm ? t("cancel") : "+ Bulk create"}
          </button>
          <button
            className="button-primary"
            onClick={() =>
              showForm && !editingLocation ? resetForm() : setShowForm(true)
            }
          >
            {showForm && !editingLocation ? t("cancel") : t("addLocation")}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {showBulkForm && (
        <div className="location-form">
          <h3>Bulk create locations</h3>
          <p className="hint">{t("bulkCreateHint")}</p>
          <div className="form-row">
            <div className="form-group">
              <label>From bookcase</label>
              <input
                type="text"
                value={bulkFrom}
                onChange={(e) => setBulkFrom(e.target.value.toUpperCase())}
                placeholder="e.g. A"
                maxLength={3}
              />
            </div>
            <div className="form-group">
              <label>To bookcase</label>
              <input
                type="text"
                value={bulkTo}
                onChange={(e) => setBulkTo(e.target.value.toUpperCase())}
                placeholder="e.g. F"
                maxLength={3}
              />
            </div>
            <div className="form-group">
              <label>Shelves per bookcase</label>
              <input
                type="number"
                value={bulkShelves}
                onChange={(e) => setBulkShelves(e.target.value)}
                placeholder="e.g. 5"
                min="1"
                max="20"
              />
            </div>
          </div>
          {bulkPreview.length > 0 && bulkShelves && (
            <p className="bulk-preview">
              This will create {bulkPreview.length * Number(bulkShelves)}{" "}
              locations ({bulkPreview[0]}1 →{" "}
              {bulkPreview[bulkPreview.length - 1]}
              {bulkShelves})
            </p>
          )}
          {bulkError && <p className="error">{bulkError}</p>}
          <button
            className="button-primary"
            onClick={handleBulkCreate}
            disabled={isBulkSaving || bulkPreview.length === 0 || !bulkShelves}
          >
            {isBulkSaving
              ? "Creating..."
              : `Create ${bulkPreview.length * (Number(bulkShelves) || 0)} locations`}
          </button>
        </div>
      )}

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
            <button
              type="submit"
              className="button-primary"
              disabled={isPending}
            >
              {isPending
                ? t("saving")
                : editingLocation
                  ? t("saveChanges")
                  : t("saveLocation")}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={resetForm}
            >
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
                  {location.customCode ??
                    `${location.bookCase}${location.shelfNumber}`}
                </span>
                {location.description && (
                  <span className="location-description">
                    {location.description}
                  </span>
                )}
              </div>
              <div className="location-actions">
                <span className="book-count">
                  {location.bookCount} {t("books")}
                </span>
                <button
                  className="button-secondary"
                  onClick={() => handleEdit(location)}
                >
                  {t("edit")}
                </button>
                <button
                  className="button-danger"
                  onClick={() => deleteMutation.mutate(location.id)}
                  disabled={location.bookCount > 0}
                  title={
                    location.bookCount > 0
                      ? "Move all books to another location first"
                      : "Delete location"
                  }
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
