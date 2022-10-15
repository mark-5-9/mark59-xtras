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
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9928057553956835, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "DH_lifecycle_0400__net_count_policies_breakdown_action (CDP)"], "isController": false}, {"data": [0.9893617021276596, 500, 1500, "DH_lifecycle_0200_addPolicy"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0600__net_print_selected_policies_action (CDP)"], "isController": false}, {"data": [0.9736842105263158, 500, 1500, "DH_lifecycle_0500_useNextPolicy"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0300__net_count_policies_action (CDP)"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0001__net_delete_multiple_policies (CDP)"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_9999_finalize_deleteMultiplePolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0299_sometimes_I_fail"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0500__net_use_next_policy_action (CDP)"], "isController": false}, {"data": [0.9473684210526315, 500, 1500, "DH_lifecycle_0300_countUnusedPolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0001_loadInitialPage"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0600_displaySelectedPolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0099_gotoDeleteMultiplePoliciesUrl"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0200__net_add_policy_action (CDP)"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0100__net_delete_multiple_policies_action (CDP)"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0100_deleteMultiplePolicies"], "isController": false}, {"data": [1.0, 500, 1500, "DH_lifecycle_0400_countUnusedPoliciesCurrentThread"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 278, 0, 0.0, 159.0251798561151, 0, 974, 149.0, 387.1, 425.1, 694.5499999999988, 3.3658619270164905, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DH_lifecycle_0400__net_count_policies_breakdown_action (CDP)", 7, 0, 0.0, 6.857142857142857, 4, 12, 7.0, 12.0, 12.0, 12.0, 0.10275229357798164, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0200_addPolicy", 47, 0, 0.0, 391.8085106382977, 340, 683, 381.0, 450.0, 482.0, 683.0, 0.6064829152472385, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0600__net_print_selected_policies_action (CDP)", 7, 0, 0.0, 8.142857142857144, 4, 16, 6.0, 16.0, 16.0, 16.0, 0.10330730973007275, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0500_useNextPolicy", 19, 0, 0.0, 218.21052631578948, 141, 974, 173.0, 227.0, 974.0, 974.0, 0.24661552639435122, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0300__net_count_policies_action (CDP)", 7, 0, 0.0, 5.285714285714286, 4, 6, 5.0, 6.0, 6.0, 6.0, 0.10266187577913032, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0001__net_delete_multiple_policies (CDP)", 7, 0, 0.0, 67.28571428571429, 57, 77, 69.0, 77.0, 77.0, 77.0, 0.10021474588403721, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_9999_finalize_deleteMultiplePolicies", 4, 0, 0.0, 158.75, 138, 182, 157.5, 182.0, 182.0, 182.0, 0.09766817238432426, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0299_sometimes_I_fail", 19, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.24593877418937285, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0500__net_use_next_policy_action (CDP)", 7, 0, 0.0, 9.571428571428573, 6, 15, 9.0, 15.0, 15.0, 15.0, 0.1031535514294135, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0300_countUnusedPolicies", 19, 0, 0.0, 241.78947368421052, 154, 738, 189.0, 561.0, 738.0, 738.0, 0.24549072303478217, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0001_loadInitialPage", 11, 0, 0.0, 319.6363636363636, 122, 476, 327.0, 466.20000000000005, 476.0, 476.0, 0.15690078165116678, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0600_displaySelectedPolicies", 7, 0, 0.0, 176.00000000000003, 118, 326, 175.0, 326.0, 326.0, 326.0, 0.10308367449120844, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0099_gotoDeleteMultiplePoliciesUrl", 19, 0, 0.0, 45.578947368421055, 20, 84, 41.0, 78.0, 84.0, 84.0, 0.24575745033112584, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0200__net_add_policy_action (CDP)", 35, 0, 0.0, 5.9142857142857155, 4, 15, 5.0, 8.799999999999997, 10.999999999999979, 15.0, 0.4537146264632297, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0100__net_delete_multiple_policies_action (CDP)", 14, 0, 0.0, 8.499999999999998, 4, 18, 8.0, 17.0, 18.0, 18.0, 0.17087340721573988, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0100_deleteMultiplePolicies", 30, 0, 0.0, 207.26666666666662, 118, 383, 187.5, 283.70000000000005, 350.54999999999995, 383.0, 0.3652523284835941, 0.0, 0.0], "isController": false}, {"data": ["DH_lifecycle_0400_countUnusedPoliciesCurrentThread", 19, 0, 0.0, 188.4736842105263, 136, 494, 158.0, 290.0, 494.0, 494.0, 0.2464363999533068, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 278, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
