using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.Domain.Entities;

public class BookItem
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public Guid? LocationId { get; set; }

    public BookCondition Condition { get; set; }
    public BookStatus Status { get; set; }
    public BookItemSource Source { get; set; }

    public DateOnly? AcquiredDate { get; set; }
    public decimal? AcquiredPrice { get; set; }
    public decimal? EstimatedValue { get; set; }

    public string? UserCoverImagePath { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public Book Book { get; set; } = null!;
    public Location? Location { get; set; }
    public Listing? Listing { get; set; }
    public ICollection<LendingRecord> LendingRecords { get; set; } = [];
    public ICollection<BookItemTag> BookItemTags { get; set; } = [];
}