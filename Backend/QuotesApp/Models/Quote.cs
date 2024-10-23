using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace QuotesApp.Models
{
    public class Quote
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public ICollection<QuoteTag> QuoteTags { get; set; } = new List<QuoteTag>();

        public string? UserId { get; set; }

        [ForeignKey("UserId")]
        public IdentityUser? User { get; set; }
    }
}
