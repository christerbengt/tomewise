import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookItem, updateBookItem, deleteBookItem } from "../api/bookItems";
import { getLocations } from "../api/locations";
import { lendBook } from "../api/lending";
import { createListing } from "../api/listings";

const conditionLabels: Record<number, string> = {
  0: "New",
  1: "Like new",
  2: "Very good",
  3: "Good",
  4: "Fair",
  5: "Poor",
};

const statusLabels: Record<number, string> = {
  0: "In collection",
  1: "Wishlist",
  2: "Lent",
  3: "For sale",
  4: "Sold",
};

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ["bookItem", id],
    queryFn: () => getBookItem(id!),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");
  const [locationId, setLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [acquiredDate, setAcquiredDate] = useState("");
  const [acquiredPrice, setAcquiredPrice] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");

  const [showLendForm, setShowLendForm] = useState(false);
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerContact, setBorrowerContact] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  const [showListForm, setShowListForm] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const [platform, setPlatform] = useState("0");
  const [listingDescription, setListingDescription] = useState("");

  const startEditing = () => {
    if (!item) return;
    setCondition(item.condition.toString());
    setStatus(item.status.toString());
    setLocationId(item.locationId ?? "");
    setNotes(item.notes ?? "");
    setTags(item.tags.join(", "));
    setAcquiredDate(item.acquiredDate ?? "");
    setAcquiredPrice(item.acquiredPrice?.toString() ?? "");
    setEstimatedValue(item.estimatedValue?.toString() ?? "");
    setIsEditing(true);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBookItem(id!, {
        locationId: locationId || null,
        condition: Number(condition),
        status: Number(status),
        acquiredDate: acquiredDate || null,
        acquiredPrice: acquiredPrice ? Number(acquiredPrice) : null,
        estimatedValue: estimatedValue ? Number(estimatedValue) : null,
        userCoverImagePath: item?.userCoverImagePath ?? null,
        notes: notes || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookItem", id] });
      queryClient.invalidateQueries({ queryKey: ["bookItems"] });
      setIsEditing(false);
      setError(null);
    },
    onError: () => setError("Failed to save changes"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBookItem(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookItems"] });
      navigate("/my-books");
    },
    onError: () => setError("Failed to delete book item"),
  });

  const lendMutation = useMutation({
    mutationFn: () =>
      lendBook({
        bookItemId: id!,
        borrowerName,
        borrowerContact: borrowerContact || null,
        lentDate: new Date().toISOString().split("T")[0],
        expectedReturnDate: expectedReturnDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookItem", id] });
      queryClient.invalidateQueries({ queryKey: ["bookItems"] });
      queryClient.invalidateQueries({ queryKey: ["activeLendings"] });
      setShowLendForm(false);
      setBorrowerName("");
      setBorrowerContact("");
      setExpectedReturnDate("");
      setError(null);
    },
    onError: () => setError("Failed to lend book"),
  });

  const listMutation = useMutation({
    mutationFn: () =>
      createListing({
        bookItemId: id!,
        askingPrice: Number(askingPrice),
        listedDate: new Date().toISOString().split("T")[0],
        platform: Number(platform),
        description: listingDescription || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookItem", id] });
      queryClient.invalidateQueries({ queryKey: ["bookItems"] });
      queryClient.invalidateQueries({ queryKey: ["activeListings"] });
      setShowListForm(false);
      setAskingPrice("");
      setPlatform("0");
      setListingDescription("");
      setError(null);
    },
    onError: () => setError("Failed to create listing"),
  });

  const handleDelete = () => {
    if (
      confirm("Are you sure you want to remove this copy from your collection?")
    ) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (!item)
    return (
      <div className="empty-state">
        <p>Book not found.</p>
      </div>
    );

  return (
    <div className="book-detail-page">
      <div className="page-header">
        <button
          className="button-secondary"
          onClick={() => navigate("/my-books")}
        >
          ← Back
        </button>
        <div className="header-actions">
          {!isEditing && item.status !== 1 && item.status !== 4 && (
            <button className="button-primary" onClick={startEditing}>
              Edit
            </button>
          )}
          <button
            className="button-danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="book-detail-card">
        <div className="book-detail-header">
          <div className="book-detail-cover">
            {item.coverImageUrl ? (
              <img src={item.coverImageUrl} alt={item.bookTitle} />
            ) : (
              <div className="book-cover-placeholder">📖</div>
            )}
          </div>
          <div>
            <h2>{item.bookTitle}</h2>
            <p className="book-detail-location">
              {item.locationDescription ?? "Unshelved"}
            </p>
            {/* Action buttons — only show for books in collection */}
            {item.status === 0 && !isEditing && (
              <div className="book-detail-actions">
                <button
                  className="button-primary"
                  onClick={() => {
                    setShowLendForm(!showLendForm);
                    setShowListForm(false);
                  }}
                >
                  {showLendForm ? "Cancel" : "Lend book"}
                </button>
                <button
                  className="button-secondary"
                  onClick={() => {
                    setShowListForm(!showListForm);
                    setShowLendForm(false);
                  }}
                >
                  {showListForm ? "Cancel" : "List for sale"}
                </button>
              </div>
            )}

            {showLendForm && (
              <div className="action-form">
                <h4>Lend book</h4>
                <div className="form-group">
                  <label htmlFor="borrowerName">Borrower name *</label>
                  <input
                    id="borrowerName"
                    type="text"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="borrowerContact">Contact (optional)</label>
                  <input
                    id="borrowerContact"
                    type="text"
                    value={borrowerContact}
                    onChange={(e) => setBorrowerContact(e.target.value)}
                    placeholder="Email or phone"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expectedReturnDate">
                    Expected return date (optional)
                  </label>
                  <input
                    id="expectedReturnDate"
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                  />
                </div>
                <button
                  className="button-primary"
                  onClick={() => lendMutation.mutate()}
                  disabled={!borrowerName || lendMutation.isPending}
                >
                  {lendMutation.isPending ? "Saving..." : "Confirm lend"}
                </button>
              </div>
            )}

            {showListForm && (
              <div className="action-form">
                <h4>List for sale</h4>
                <div className="form-group">
                  <label htmlFor="askingPrice">Asking price (SEK) *</label>
                  <input
                    id="askingPrice"
                    type="number"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="platform">Platform</label>
                  <select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="0">Direct</option>
                    <option value="1">Adlibris</option>
                    <option value="2">Tradera</option>
                    <option value="3">Facebook</option>
                    <option value="4">eBay</option>
                    <option value="5">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="listingDescription">
                    Description (optional)
                  </label>
                  <textarea
                    id="listingDescription"
                    value={listingDescription}
                    onChange={(e) => setListingDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <button
                  className="button-primary"
                  onClick={() => listMutation.mutate()}
                  disabled={!askingPrice || listMutation.isPending}
                >
                  {listMutation.isPending ? "Saving..." : "Create listing"}
                </button>
              </div>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div className="book-detail-fields">
            <div className="detail-row">
              <span className="detail-label">Condition</span>
              <span className="detail-value">
                {conditionLabels[item.condition]}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">{statusLabels[item.status]}</span>
            </div>
            {item.acquiredDate && (
              <div className="detail-row">
                <span className="detail-label">Acquired</span>
                <span className="detail-value">{item.acquiredDate}</span>
              </div>
            )}
            {item.acquiredPrice && (
              <div className="detail-row">
                <span className="detail-label">Price paid</span>
                <span className="detail-value">{item.acquiredPrice} SEK</span>
              </div>
            )}
            {item.estimatedValue && (
              <div className="detail-row">
                <span className="detail-label">Estimated value</span>
                <span className="detail-value">{item.estimatedValue} SEK</span>
              </div>
            )}
            {item.notes && (
              <div className="detail-row">
                <span className="detail-label">Notes</span>
                <span className="detail-value">{item.notes}</span>
              </div>
            )}
            {item.tags.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Tags</span>
                <div className="book-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="book-detail-fields">
            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="0">New</option>
                <option value="1">Like new</option>
                <option value="2">Very good</option>
                <option value="3">Good</option>
                <option value="4">Fair</option>
                <option value="5">Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="0">In collection</option>
                <option value="1">Wishlist</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">Unshelved</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.customCode ?? `${loc.bookCase}${loc.shelfNumber}`}
                    {loc.description ? ` — ${loc.description}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="acquiredDate">Date acquired</label>
                <input
                  id="acquiredDate"
                  type="date"
                  value={acquiredDate}
                  onChange={(e) => setAcquiredDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="acquiredPrice">Price paid</label>
                <input
                  id="acquiredPrice"
                  type="number"
                  value={acquiredPrice}
                  onChange={(e) => setAcquiredPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="estimatedValue">Estimated value (SEK)</label>
              <input
                id="estimatedValue"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separate tags with commas"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="button-group">
              <button
                className="button-primary"
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </button>
              <button
                className="button-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
