/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7259615384615384, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "DH-lifecycle-0299-sometimes-I-fail"], "isController": false}, {"data": [0.75, 500, 1500, "DH-lifecycle-9999-finalize-deleteMultiplePolicies"], "isController": false}, {"data": [0.7692307692307693, 500, 1500, "DH-lifecycle-0100-deleteMultiplePolicies"], "isController": false}, {"data": [0.6875, 500, 1500, "DH-lifecycle-0400-countUnusedPoliciesCurrentThread"], "isController": false}, {"data": [0.0, 500, 1500, "dokcerSetup"], "isController": false}, {"data": [0.6875, 500, 1500, "DH-lifecycle-0200-addPolicy"], "isController": false}, {"data": [0.9230769230769231, 500, 1500, "DH-lifecycle-0001-gotoDeleteMultiplePoliciesUrl"], "isController": false}, {"data": [0.625, 500, 1500, "DH-lifecycle-0500-useNextPolicy"], "isController": false}, {"data": [0.5625, 500, 1500, "DH-lifecycle-0300-countUnusedPolicies"], "isController": false}, {"data": [0.5, 500, 1500, "DH-lifecycle-0600-displaySelectedPolicies"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 104, 0, 0.0, 1642.4807692307695, 0, 15071, 275.0, 5360.5, 12398.75, 14999.650000000003, 0.4591895304787051, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["DH-lifecycle-0299-sometimes-I-fail", 8, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.03869164212165619, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-9999-finalize-deleteMultiplePolicies", 2, 0, 0.0, 474.0, 445, 503, 474.0, 503.0, 503.0, 503.0, 0.22504782266231574, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0100-deleteMultiplePolicies", 13, 0, 0.0, 500.9230769230769, 111, 1624, 345.0, 1410.3999999999999, 1624.0, 1624.0, 0.058709828928590786, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0400-countUnusedPoliciesCurrentThread", 8, 0, 0.0, 2102.375, 98, 11567, 327.5, 11567.0, 11567.0, 11567.0, 0.038327208964734176, 0.0, 0.0], "isController": false}, {"data": ["dokcerSetup", 1, 0, 0.0, 2436.0, 2436, 2436, 2436.0, 2436.0, 2436.0, 2436.0, 0.41050903119868637, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0200-addPolicy", 40, 0, 0.0, 2285.8000000000006, 84, 13644, 247.0, 12360.899999999998, 13280.749999999998, 13644.0, 0.19148375978362336, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0001-gotoDeleteMultiplePoliciesUrl", 13, 0, 0.0, 318.00000000000006, 16, 1438, 173.0, 1118.7999999999997, 1438.0, 1438.0, 0.058666113099240504, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0500-useNextPolicy", 8, 0, 0.0, 2562.25, 114, 15071, 499.0, 15071.0, 15071.0, 15071.0, 0.038310323195464055, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0300-countUnusedPolicies", 8, 0, 0.0, 2166.0, 141, 12149, 562.0, 12149.0, 12149.0, 12149.0, 0.03851004630833069, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0600-displaySelectedPolicies", 3, 0, 0.0, 3570.333333333333, 175, 9915, 621.0, 9915.0, 9915.0, 9915.0, 0.014704152452652629, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 104, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
