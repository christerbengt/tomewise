using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.Domain.Entities;

public class Location
{
    public Guid Id { get; set; }
    public string BookCase { get; set; } = string.Empty;
    public int ShelfNumber { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<BookItem> BookItems { get; set;} = [];
}