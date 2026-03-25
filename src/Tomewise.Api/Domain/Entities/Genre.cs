namespace Tomewise.Api.Domain.Entities;

public class Genre
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<BookGenre> BookGenres { get; set; } = [];
}