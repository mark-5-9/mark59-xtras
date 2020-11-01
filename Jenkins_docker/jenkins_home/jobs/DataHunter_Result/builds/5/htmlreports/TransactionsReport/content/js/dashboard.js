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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.892578125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "DH-lifecycle-0299-sometimes-I-fail"], "isController": false}, {"data": [0.7, 500, 1500, "DH-lifecycle-9999-finalize-deleteMultiplePolicies"], "isController": false}, {"data": [0.90625, 500, 1500, "DH-lifecycle-0100-deleteMultiplePolicies"], "isController": false}, {"data": [0.825, 500, 1500, "DH-lifecycle-0400-countUnusedPoliciesCurrentThread"], "isController": false}, {"data": [0.89, 500, 1500, "DH-lifecycle-0200-addPolicy"], "isController": false}, {"data": [0.984375, 500, 1500, "DH-lifecycle-0001-gotoDeleteMultiplePoliciesUrl"], "isController": false}, {"data": [0.85, 500, 1500, "DH-lifecycle-0500-useNextPolicy"], "isController": false}, {"data": [0.825, 500, 1500, "DH-lifecycle-0300-countUnusedPolicies"], "isController": false}, {"data": [0.7857142857142857, 500, 1500, "DH-lifecycle-0600-displaySelectedPolicies"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 256, 0, 0.0, 308.33984375, 0, 2970, 117.0, 1178.4000000000005, 1672.9499999999994, 2389.16, 1.8331936955323065, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["DH-lifecycle-0299-sometimes-I-fail", 20, 0, 0.0, 0.05000000000000001, 0, 1, 0.0, 0.0, 0.9499999999999993, 1.0, 0.1667097333477815, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-9999-finalize-deleteMultiplePolicies", 5, 0, 0.0, 884.0, 81, 2970, 277.0, 2970.0, 2970.0, 2970.0, 0.04967167025958415, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0100-deleteMultiplePolicies", 32, 0, 0.0, 278.68749999999994, 79, 1528, 130.5, 943.3999999999999, 1457.7999999999997, 1528.0, 0.22964419502533262, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0400-countUnusedPoliciesCurrentThread", 20, 0, 0.0, 442.95, 81, 2384, 113.5, 2113.200000000001, 2373.1499999999996, 2384.0, 0.1613254498963484, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0200-addPolicy", 100, 0, 0.0, 339.92, 75, 2396, 118.0, 1323.6000000000004, 1798.9999999999984, 2393.889999999999, 0.8288094152749576, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0001-gotoDeleteMultiplePoliciesUrl", 32, 0, 0.0, 130.375, 14, 1044, 73.5, 297.9, 597.4499999999986, 1044.0, 0.23106862015929294, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0500-useNextPolicy", 20, 0, 0.0, 345.9, 81, 1792, 121.5, 1614.400000000002, 1787.4499999999998, 1792.0, 0.15355204262604702, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0300-countUnusedPolicies", 20, 0, 0.0, 445.45000000000005, 89, 2067, 127.0, 1848.9000000000005, 2057.1, 2067.0, 0.1639545845800713, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0600-displaySelectedPolicies", 7, 0, 0.0, 392.28571428571433, 94, 1592, 127.0, 1592.0, 1592.0, 1592.0, 0.05534778173997612, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 256, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
