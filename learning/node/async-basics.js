const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('start');

  await sleep(200);
  console.log('after 200ms');

  await Promise.all([sleep(100), sleep(50)]);
  console.log('both timers resolved');

  try {
    throw new Error('demo error');
  } catch (err) {
    console.log('caught:', err.message);
  }

  console.log('done');
}

run();
