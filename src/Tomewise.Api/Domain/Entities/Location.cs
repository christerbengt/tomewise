using Tomewise.Api.Domain.Enums;

namespace Tomewise.Api.Domain.Entities;

public class Location
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string BookCase { get; set; } = string.Empty;
    public int ShelfNumber { get; set; }
    public string? CustomCode { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<BookItem> BookItems { get; set; } = [];
}