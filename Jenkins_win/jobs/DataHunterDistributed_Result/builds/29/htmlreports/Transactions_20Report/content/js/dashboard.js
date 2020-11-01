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
    cell.colSpan = 6;
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.977027027027027, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "DH-lifecycle-0299-sometimes-I-fail"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-9999-finalize-deleteMultiplePolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-0100-deleteMultiplePolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-0400-countUnusedPoliciesCurrentThread"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-0200-addPolicy"], "isController": false}, {"data": [0.8152173913043478, 500, 1500, "DH-lifecycle-0001-gotoDeleteMultiplePoliciesUrl"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-0500-useNextPolicy"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-0300-countUnusedPolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH-lifecycle-0600-displaySelectedPolicies"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 370, 0, 0.0, 164.60810810810807, 0, 1207, 215.0, 358.6499999999996, 1064.2400000000011, 4.633978333020226, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["DH-lifecycle-0299-sometimes-I-fail", 29, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.42108931449563664, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-9999-finalize-deleteMultiplePolicies", 6, 0, 0.0, 135.33333333333334, 116, 163, 163.0, 163.0, 163.0, 0.12374450883742034, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0100-deleteMultiplePolicies", 46, 0, 0.0, 156.58695652173907, 97, 329, 202.0, 248.5, 329.0, 0.6156234525769194, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0400-countUnusedPoliciesCurrentThread", 29, 0, 0.0, 158.96551724137933, 110, 341, 199.0, 293.0, 341.0, 0.42018633090398017, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0200-addPolicy", 145, 0, 0.0, 150.00689655172425, 98, 288, 198.4, 227.7, 285.23999999999995, 2.0237546930173482, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0001-gotoDeleteMultiplePoliciesUrl", 46, 0, 0.0, 344.5217391304348, 13, 1207, 1006.7000000000003, 1150.1499999999999, 1207.0, 0.6099663192510674, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0500-useNextPolicy", 29, 0, 0.0, 142.448275862069, 96, 214, 175.0, 212.0, 214.0, 0.42018633090398017, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0300-countUnusedPolicies", 29, 0, 0.0, 167.44827586206893, 108, 379, 315.0, 360.5, 379.0, 0.4202045961688933, 0.0, 0.0], "isController": false}, {"data": ["DH-lifecycle-0600-displaySelectedPolicies", 11, 0, 0.0, 154.0, 108, 217, 216.0, 217.0, 217.0, 0.17611835153222966, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 370, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
