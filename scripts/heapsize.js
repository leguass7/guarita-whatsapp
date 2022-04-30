const v8 = require('v8');

function print() {
   // console.log('🔥 Current heap size:', (require('v8').getHeapStatistics().total_available_size  / 1024 / 1024).toFixed(2), 'Mb');
   console.log('Current heap size:', (v8.getHeapStatistics().total_available_size / 1024 / 1024).toFixed(2))
}

print()