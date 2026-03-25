namespace Tomewise.Api.Domain.Entities;

public class BookGenre
{
    public Guid BookId { get; set; }
    public Guid GenreId { get; set; }

    // Navigation properties
    public Book Book { get; set; } = null!;
    public Genre Genre { get; set; } = null!;
}