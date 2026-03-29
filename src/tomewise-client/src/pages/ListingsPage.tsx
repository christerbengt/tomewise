import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getListings, cancelListing, markAsSold } from "../api/listings";
import { useTranslation } from "react-i18next";

const platformLabels: Record<number, string> = {
  0: "Direct",
  1: "Adlibris",
  2: "Tradera",
  3: "Facebook",
  4: "eBay",
  5: "Other",
};

const ListingsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [soldPrices, setSoldPrices] = useState<Record<string, string>>({});

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["activeListings"] });
      queryClient.invalidateQueries({ queryKey: ["bookItems"] });
    },
    onError: () => setError("Failed to cancel listing"),
  });

  const soldMutation = useMutation({
    mutationFn: ({ id, soldPrice }: { id: string; soldPrice: number }) =>
      markAsSold(id, {
        soldPrice,
        soldDate: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["activeListings"] });
      queryClient.invalidateQueries({ queryKey: ["bookItems"] });
    },
    onError: () => setError("Failed to mark as sold"),
  });

  const handleMarkSold = (id: string) => {
    const price = soldPrices[id];
    if (!price || isNaN(Number(price))) {
      setError("Please enter a valid sold price");
      return;
    }
    setError(null);
    soldMutation.mutate({ id, soldPrice: Number(price) });
  };

  const active = listings.filter((l) => l.status === 0);
  const closed = listings.filter((l) => l.status !== 0);

  if (isLoading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="listings-page">
      <div className="page-header">
        <h2>{t("listings")}</h2>
      </div>

      {error && <p className="error">{error}</p>}

      {listings.length === 0 ? (
        <div className="empty-state">
          <p>{t("noListings")}</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="section">
              <h3>{t("active", { count: active.length })}</h3>
              <div className="listing-list">
                {active.map((listing) => (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-info">
                      <span className="listing-title">{listing.bookTitle}</span>
                      <span className="listing-meta">
                        {platformLabels[listing.platform]} · {t("askingPrice")} {listing.askingPrice} SEK
                      </span>
                      {listing.description && (
                        <span className="listing-description">{listing.description}</span>
                      )}
                    </div>
                    <div className="listing-actions">
                      <div className="sold-input-group">
                        <input
                          type="number"
                          placeholder={t("soldPrice")}
                          value={soldPrices[listing.id] ?? ""}
                          onChange={(e) =>
                            setSoldPrices((prev) => ({
                              ...prev,
                              [listing.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          className="button-primary"
                          onClick={() => handleMarkSold(listing.id)}
                          disabled={soldMutation.isPending}
                        >
                          {t("markSold")}
                        </button>
                      </div>
                      <button
                        className="button-danger"
                        onClick={() => cancelMutation.mutate(listing.id)}
                        disabled={cancelMutation.isPending}
                      >
                        {t("cancelListing")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {closed.length > 0 && (
            <div className="section">
              <h3>{t("closed", { count: closed.length })}</h3>
              <div className="listing-list">
                {closed.map((listing) => (
                  <div key={listing.id} className="listing-card listing-card--closed">
                    <div className="listing-info">
                      <span className="listing-title">{listing.bookTitle}</span>
                      <span className="listing-meta">
                        {platformLabels[listing.platform]}
                        {listing.soldPrice && ` · ${t("soldFor")} ${listing.soldPrice} SEK`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingsPage;