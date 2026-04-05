using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Tomewise.Api.Domain.Entities;

namespace Tomewise.Api.Data;

public class BookTrackerDbContext(DbContextOptions<BookTrackerDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<BookItem> BookItems => Set<BookItem>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<LendingRecord> LendingRecords => Set<LendingRecord>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<Invite> Invites => Set<Invite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Book
        modelBuilder.Entity<Book>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(b => b.Title).IsRequired().HasMaxLength(500);
            e.Property(b => b.Isbn10).HasMaxLength(10);
            e.Property(b => b.Isbn13).HasMaxLength(13);
            e.Property(b => b.Publisher).HasMaxLength(300);
            e.Property(b => b.Language).HasMaxLength(50);
            e.Property(b => b.CoverImageUrl).HasMaxLength(2048);
            e.Property(b => b.Source).HasConversion<string>();

            e.HasIndex(b => b.Isbn13).IsUnique();
            e.HasIndex(b => b.Isbn10).IsUnique();
        });

        // Author
        modelBuilder.Entity<Author>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(a => a.Name).IsRequired().HasMaxLength(300);
        });

        // Genre
        modelBuilder.Entity<Genre>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(g => g.Name).IsRequired().HasMaxLength(100);
            e.HasIndex(g => g.Name).IsUnique();
        });

        // BookAuthor
        modelBuilder.Entity<BookAuthor>(e =>
        {
            e.HasKey(ba => new { ba.BookId, ba.AuthorId });

            e.HasOne(ba => ba.Book)
                .WithMany(b => b.BookAuthors)
                .HasForeignKey(ba => ba.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ba => ba.Author)
                .WithMany(a => a.BookAuthors)
                .HasForeignKey(ba => ba.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // BookGenre
        modelBuilder.Entity<BookGenre>(e =>
        {
            e.HasKey(bg => new { bg.BookId, bg.GenreId });

            e.HasOne(bg => bg.Book)
                .WithMany(b => b.BookGenres)
                .HasForeignKey(bg => bg.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(bg => bg.Genre)
                .WithMany(g => g.BookGenres)
                .HasForeignKey(bg => bg.GenreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Location
        modelBuilder.Entity<Location>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(l => l.BookCase).IsRequired().HasMaxLength(10);
            e.HasIndex(l => new { l.BookCase, l.ShelfNumber }).IsUnique();

            e.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

        });

        // Tag
        modelBuilder.Entity<Tag>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(t => t.Name).IsRequired().HasMaxLength(100);
            e.HasIndex(t => t.Name).IsUnique();

            e.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // BookItem
        modelBuilder.Entity<BookItem>(e =>
        {
            e.HasKey(bi => bi.Id);
            e.Property(bi => bi.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(bi => bi.Condition).HasConversion<string>();
            e.Property(bi => bi.Status).HasConversion<string>();
            e.Property(bi => bi.Source).HasConversion<string>();
            e.Property(bi => bi.AcquiredPrice).HasPrecision(10, 2);
            e.Property(bi => bi.EstimatedValue).HasPrecision(10, 2);
            e.Property(bi => bi.UserCoverImagePath).HasMaxLength(1024);

            e.HasOne(bi => bi.Book)
                .WithMany(b => b.BookItems)
                .HasForeignKey(bi => bi.BookId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(bi => bi.Location)
                .WithMany(l => l.BookItems)
                .HasForeignKey(bi => bi.LocationId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(bi => bi.Status);

            e.HasOne(bi => bi.User)
                .WithMany()
                .HasForeignKey(bi => bi.UserId)
                .OnDelete(DeleteBehavior.Cascade);

        });

        // BookItemTag
        modelBuilder.Entity<BookItemTag>(e =>
        {
            e.HasKey(bt => new { bt.BookItemId, bt.TagId });

            e.HasOne(bt => bt.BookItem)
                .WithMany(bi => bi.BookItemTags)
                .HasForeignKey(bt => bt.BookItemId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(bt => bt.Tag)
                .WithMany(t => t.BookItemTags)
                .HasForeignKey(bt => bt.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // LendingRecord
        modelBuilder.Entity<LendingRecord>(e =>
        {
            e.HasKey(lr => lr.Id);
            e.Property(lr => lr.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(lr => lr.BorrowerName).IsRequired().HasMaxLength(200);
            e.Property(lr => lr.BorrowerContact).HasMaxLength(200);

            e.HasOne(lr => lr.BookItem)
                .WithMany(bi => bi.LendingRecords)
                .HasForeignKey(lr => lr.BookItemId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Ignore(lr => lr.IsReturned);
            e.Ignore(lr => lr.IsOverdue);

            e.HasIndex(lr => lr.ReturnedDate);
        });

        // Listing
        modelBuilder.Entity<Listing>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(l => l.AskingPrice).IsRequired().HasPrecision(10, 2);
            e.Property(l => l.SoldPrice).HasPrecision(10, 2);
            e.Property(l => l.Platform).HasConversion<string>();
            e.Property(l => l.Status).HasConversion<string>();

            e.HasOne(l => l.BookItem)
                .WithOne(bi => bi.Listing)
                .HasForeignKey<Listing>(l => l.BookItemId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(l => l.Status);
        });

        // Invite
        modelBuilder.Entity<Invite>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(i => i.Code).IsRequired().HasMaxLength(32);
            e.HasIndex(i => i.Code).IsUnique();

            e.HasOne(i => i.CreatedBy)
                .WithMany(u => u.CreatedInvites)
                .HasForeignKey(i => i.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(i => i.UsedBy)
                .WithMany(u => u.UsedInvites)
                .HasForeignKey(i => i.UsedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            e.Ignore(i => i.IsValid);
        });


    }
}