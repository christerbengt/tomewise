using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tomewise.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIsbnIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Books_Isbn10",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_Isbn13",
                table: "Books");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Isbn10",
                table: "Books",
                column: "Isbn10",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Books_Isbn13",
                table: "Books",
                column: "Isbn13",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Books_Isbn10",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_Isbn13",
                table: "Books");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Isbn10",
                table: "Books",
                column: "Isbn10");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Isbn13",
                table: "Books",
                column: "Isbn13");
        }
    }
}
