﻿using System.Collections.Generic;

namespace QuotesApp.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<QuoteTag> QuoteTags  { get; set; } = new List<QuoteTag>();
    }
}
