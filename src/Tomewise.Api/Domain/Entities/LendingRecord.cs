namespace Tomewise.Api.Domain.Entities;

public class LendingRecord
{
    public Guid Id { get; set; }
    public Guid BookItemId { get; set; }

    public string BorrowerName { get; set; } = string.Empty;
    public string? BorrowerContact { get; set; }

    public DateOnly LentDate { get; set; }
    public DateOnly? ExpectedReturnDate { get; set; }
    public DateOnly? ReturnedDate { get; set; }

    // Navigation properties
    public BookItem BookItem { get; set; } = null!;

    // Computed properties
    public bool IsReturned => ReturnedDate.HasValue;
    public bool IsOverdue => !IsReturned 
        && ExpectedReturnDate.HasValue 
        && ExpectedReturnDate.Value < DateOnly.FromDateTime(DateTime.Today);
}