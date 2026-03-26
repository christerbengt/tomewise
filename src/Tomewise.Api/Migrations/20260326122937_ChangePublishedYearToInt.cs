using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tomewise.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangePublishedYearToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "ALTER TABLE \"Books\" ALTER COLUMN \"PublishedYear\" TYPE integer USING \"PublishedYear\"::integer"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PublishedYear",
                table: "Books",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
