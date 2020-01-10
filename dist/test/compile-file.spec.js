"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oper_1 = require("../src/oper");
test('compile from JSON file', () => {
    const ops = JSON.parse(require('fs').readFileSync('./test/test-plan.json'));
    // console.error('IN', ...ops)
    const [[...cops], { ...state }] = oper_1.compileOps(oper_1.parseOps(ops), {});
    // cops[0].forEach((o) => o.forEach((so) => console.error(JSON.stringify(so))))
    expect(JSON.stringify(cops))
        .toBe(JSON.stringify([
        ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00000.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00001.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00002.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00003.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00004.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00005.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00006.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00007.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00008.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00009.csv', 'rawtopic']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00010.csv', 'rawtopic']],
        ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00000.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00001.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00002.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00003.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00004.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00005.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00006.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00007.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00008.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00009.csv', 'other']], ['task', 'tasks/csvtotopic', ['s3://novisci-data/P0023/20190930/csv/novisci_events_20sep2019-part-00010.csv', 'other']]
    ]));
});
//# sourceMappingURL=compile-file.spec.js.map