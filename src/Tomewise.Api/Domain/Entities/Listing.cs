using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.Domain.Entities;

public class Listing
{
    public Guid Id { get; set; }
    public Guid BookItemId { get; set; }

    public decimal AskingPrice { get; set; }
    public decimal? SoldPrice { get; set; }
    
    public DateOnly ListedDate { get; set; }
    public DateOnly? SoldDate { get; set; }

    public ListingPlatform Platform { get; set; }
    public ListingStatus Status { get; set; }

    public string? Description { get; set; }

    // Navigation properties
    public BookItem BookItem { get; set; } = null!;
}