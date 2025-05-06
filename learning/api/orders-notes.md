# Order flow notes

- Orders reference a gig, a buyer and a seller plus one of the three packages.
- A service fee is added on top of the package price.
- Status machine: pending -> in_progress -> delivered -> completed.
- Buyers can request revisions or dispute; both sides can cancel.
- Only the buyer can review, and only after a completed order.
- Reviews update the gig rating and the seller rating through aggregations.
