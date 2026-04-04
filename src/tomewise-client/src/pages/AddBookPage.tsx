import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { lookupIsbn, createBook } from "../api/books";
import { createBookItem } from "../api/bookItems";
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "../api/locations";
import type { IsbnLookupResult } from "../types";
import { getLanguageName } from "../utils/languageCodes";
import { useTranslation } from "react-i18next";
import BarcodeScanner from "../components/BarcodeScanner";

type Step = "isbn" | "book" | "copy";

const AddBookPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("isbn");
  const [isbn, setIsbn] = useState("");
  const [isbnError, setIsbnError] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [genres, setGenres] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [language, setLanguage] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [isbn10, setIsbn10] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const [savedBookId, setSavedBookId] = useState<string | null>(null);

  const [condition, setCondition] = useState("0");
  const [status, setStatus] = useState("0");
  const [locationId, setLocationId] = useState("");
  const [acquiredDate, setAcquiredDate] = useState("");
  const [acquiredPrice, setAcquiredPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const handleIsbnKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") await handleIsbnLookup();
  };

  const handleIsbnLookup = async () => {
    if (!isbn.trim()) return;
    setIsbnError(null);
    setIsLooking(true);
    try {
      const result = await lookupIsbn(isbn.trim());
      populateFromLookup(result);
      setStep("book");
    } catch {
      setIsbnError(
        "No book found for this ISBN. You can fill in the details manually.",
      );
      setStep("book");
    } finally {
      setIsLooking(false);
    }
  };

  const populateFromLookup = (result: IsbnLookupResult) => {
    setTitle(result.title ?? "");
    setAuthors(result.authors.join(", "));
    setPublisher(result.publisher ?? "");
    setPublishedYear(result.publishedYear?.toString() ?? "");
    setLanguage(getLanguageName(result.language) ?? "");
    setPageCount(result.pageCount?.toString() ?? "");
    setIsbn10(result.isbn10 ?? "");
    setIsbn13(result.isbn13 ?? isbn);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const book = await createBook({
        title,
        isbn10: isbn10 || null,
        isbn13: isbn13 || null,
        coverImageUrl: null,
        publishedYear: publishedYear ? Number(publishedYear) : null,
        publisher: publisher || null,
        language: language || null,
        pageCount: pageCount ? Number(pageCount) : null,
        authors: authors
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        genres: genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
      });
      setSavedBookId(book.id);
      setStep("copy");
    } catch {
      setError("Failed to save book. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySubmit = async (addAnother: boolean) => {
    if (!savedBookId) return;
    setError(null);
    setIsSaving(true);
    try {
      await createBookItem({
        bookId: savedBookId,
        locationId: locationId || null,
        condition: Number(condition),
        status: Number(status),
        acquiredDate: acquiredDate || null,
        acquiredPrice: acquiredPrice ? Number(acquiredPrice) : null,
        estimatedValue: null,
        userCoverImagePath: null,
        notes: notes || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      if (addAnother) {
        setStep("isbn");
        setIsbn("");
        setTitle("");
        setAuthors("");
        setGenres("");
        setPublisher("");
        setPublishedYear("");
        setLanguage("");
        setPageCount("");
        setIsbn10("");
        setIsbn13("");
        setSavedBookId(null);
        setCondition("0");
        setStatus("0");
        setLocationId("");
        setAcquiredDate("");
        setAcquiredPrice("");
        setNotes("");
        setTags("");
        setIsbnError(null);
        setError(null);
      } else {
        navigate("/my-books");
      }
    } catch {
      setError("Failed to save copy. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-book-page">
      <div className="page-header">
        <h2>{t("addBookTitle")}</h2>
        <button
          className="button-secondary"
          onClick={() => navigate("/my-books")}
        >
          {t("cancel")}
        </button>
      </div>

      <div className="step-indicator">
        <span className={step === "isbn" ? "step active" : "step"}>
          {t("stepFind")}
        </span>
        <span className="step-divider">→</span>
        <span className={step === "book" ? "step active" : "step"}>
          {t("stepBookDetails")}
        </span>
        <span className="step-divider">→</span>
        <span className={step === "copy" ? "step active" : "step"}>
          {t("stepCopyDetails")}
        </span>
      </div>

      {step === "isbn" && (
  <div className="add-book-card">
    <h3>{t("scanOrEnterIsbn")}</h3>
    <p className="hint">{t("isbnHint")}</p>
    <div className="isbn-input-group">
      <input
        type="text"
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        onKeyDown={handleIsbnKeyDown}
        placeholder="ISBN-10 or ISBN-13"
        autoFocus
      />
      <button
        className="button-primary"
        onClick={handleIsbnLookup}
        disabled={isLooking || !isbn.trim()}
      >
        {isLooking ? t("lookingUp") : t("lookUp")}
      </button>
    </div>
    <button
      className="button-secondary"
      onClick={() => setShowScanner(true)}
    >
      📷 Use camera
    </button>
    {showScanner && (
      <BarcodeScanner
        onScan={(scannedIsbn) => {
          setIsbn(scannedIsbn);
          setShowScanner(false);
          handleIsbnLookup();
        }}
        onClose={() => setShowScanner(false)}
      />
    )}
    {isbnError && <p className="error">{isbnError}</p>}
    <button className="button-link" onClick={() => setStep("book")}>
      {t("noIsbn")}
    </button>
  </div>
)}

      {step === "book" && (
        <form onSubmit={handleBookSubmit} className="add-book-card">
          <h3>{t("bookDetails")}</h3>
          {isbnError && <p className="hint">{isbnError}</p>}
          {error && <p className="error">{error}</p>}
          <div className="form-group">
            <label htmlFor="title">{t("title")} *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="authors">{t("authors")}</label>
            <input
              id="authors"
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder={t("authorsPlaceholder")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="genres">{t("genres")}</label>
            <input
              id="genres"
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder={t("genresPlaceholder")}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="publisher">{t("publisher")}</label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="publishedYear">{t("year")}</label>
              <input
                id="publishedYear"
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">{t("language")}</label>
              <input
                id="language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pageCount">{t("pages")}</label>
              <input
                id="pageCount"
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn13">ISBN-13</label>
              <input
                id="isbn13"
                type="text"
                value={isbn13}
                onChange={(e) => setIsbn13(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="isbn10">ISBN-10</label>
              <input
                id="isbn10"
                type="text"
                value={isbn10}
                onChange={(e) => setIsbn10(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="button-primary" disabled={isSaving}>
            {isSaving ? t("saving") : t("continueToDetails")}
          </button>
        </form>
      )}

      {step === "copy" && (
        <div className="add-book-card">
          <h3>{t("copyDetails")}</h3>
          <p className="hint">{t("copyDetailsHint")}</p>
          {error && <p className="error">{error}</p>}
          <div className="form-group">
            <label htmlFor="condition">{t("condition")}</label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="0">{t("conditionNew")}</option>
              <option value="1">{t("conditionLikeNew")}</option>
              <option value="2">{t("conditionVeryGood")}</option>
              <option value="3">{t("conditionGood")}</option>
              <option value="4">{t("conditionFair")}</option>
              <option value="5">{t("conditionPoor")}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">{t("status")}</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="0">{t("inCollection")}</option>
              <option value="1">{t("wishlist")}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="location">{t("location")}</label>
            <select
              id="location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">{t("unshelved")}</option>
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
              <label htmlFor="acquiredDate">{t("dateAcquired")}</label>
              <input
                id="acquiredDate"
                type="date"
                value={acquiredDate}
                onChange={(e) => setAcquiredDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="acquiredPrice">{t("pricePaid")}</label>
              <input
                id="acquiredPrice"
                type="number"
                value={acquiredPrice}
                onChange={(e) => setAcquiredPrice(e.target.value)}
                placeholder="SEK"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="tags">{t("tags")}</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t("tagsPlaceholder")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">{t("notes")}</label>
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
              onClick={() => handleCopySubmit(false)}
              disabled={isSaving}
            >
              {isSaving ? t("saving") : t("save")}
            </button>
            <button
              className="button-secondary"
              onClick={() => handleCopySubmit(true)}
              disabled={isSaving}
            >
              {t("saveAndAddAnother")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBookPage;
