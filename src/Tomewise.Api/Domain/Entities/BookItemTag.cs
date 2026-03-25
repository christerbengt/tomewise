namespace Tomewise.Api.Domain.Entities;

public class BookItemTag
{
    public Guid BookItemId { get; set; }
    public Guid TagId { get; set; }

    // Navigation properties
    public BookItem BookItem { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}