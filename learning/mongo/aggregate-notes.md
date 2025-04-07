# MongoDB aggregate notes

- Aggregation pipelines process documents through stages.
- Common stages: $match, $group, $sort, $skip, $limit, $project, $lookup.
- $group needs an _id; helpers like $sum, $avg, $min, $max compute values.
- $lookup does a join with another collection.
- Pipelines run on the server, so only the results come back.

Example shape:

  db.orders.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$seller', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ])
