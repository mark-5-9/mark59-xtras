/*
 *  Copyright 2019 Insurance Australia Group Limited
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License"); 
 *  you may not use this file except in compliance with the License. 
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *      
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.mark59.datahunter.functionalTest.scripts;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Map;

import org.junit.Test;
import org.openqa.selenium.WebDriver;

import com.mark59.datahunter.functionalTest.dsl.*;
import com.mark59.datahunter.functionalTest.dsl.pages.*;

/**
 * Runs through the basic Data Hunter lifecycle, then an example of async processing. 
 * <p>This selenium test uses a style of DSL which experience has shown will work on simple html pages, but for applications
 * using more complex browser interactions, the style of DSL in the 'mark59-selenium-sample-dsl' project is more suitable.
 *   
 * @author Philip Webb
 * Written: Australian Winter 2019
 */
public class DataHunterSeleniumFunctionalTest  implements Serializable {
	private static final long serialVersionUID = 1L;
	
	
	/**
	 * Demonstrates capture of the timing of async events using DataHunter, with all selected rows being updated to USED. 
	 * This is functionally equivalent to the DataHunterRestApiClientSampleUsage.asyncLifeCycleTestWithUseabilityUpdate() REST API 
	 * example in the dataHunterRestApiClient project (held on the mark-5-9/mark59 github repo), but runs the web app   
	 * 'Asynchronous Message Analyzer' function. <br>
	 * Refer to <a href="https://github.com/mark-5-9/mark59-wip/blob/master/dataHunterRestApiClient/src/main/java/com/mark59/datahunter/restapi/samples/DataHunterRestApiClientSampleUsage.java#L26">REST API Equivalent</a>
	 */
	@Test
	public void asyncLifeCycleTestWithUseabilityUpdate() throws FileNotFoundException, IOException{		
		System.out.println( "\n\n>> Starting test asyncLifeCycleTestWithUseabilityUpdate - Demonstrate Async Processng with Useability Update\n" );	
		DslPageFunctions dhApi = new DslPageFunctions(DslConstants.DEFAULT_DATAHUNTER_URL);
		
		WebDriver driver = SeleniumWebdriverFactory.obtainWebDriver(SeleniumWebdriverFactory.CHROME );  // CHROME  ||  CHROME_HEADLESS
		PolicySelectionCriteria policySelectionCriteria = new PolicySelectionCriteria();		
		
//		clean up any left over data
		policySelectionCriteria.setApplicationStartsWithOrEquals(DslConstants.EQUALS);		
		policySelectionCriteria.setApplication("TESTAPI_ASYNC_TOUSED");
		policySelectionCriteria.setIdentifier(null);
		policySelectionCriteria.setLifecycle(null);		
		policySelectionCriteria.setUseability(DslConstants.UNSELECTED);	
		dhApi.deleteMultiplePolicies(policySelectionCriteria, driver);	

		dhApi.addPolicy( new Policies("TESTAPI_ASYNC_TOUSED", "T99-testonly-01", "FIRSTONE", "UNPAIRED", "", 1460613152000L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC_TOUSED", "T99-testonly-01", "between",  "UNPAIRED", "", 1460613152009L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC_TOUSED", "T99-testonly-01", "LASTONE",  "UNPAIRED", "", 1460613153001L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC_TOUSED", "T99-testonly-02", "FIRSTONE", "UNPAIRED", "", 1460613153000L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC_TOUSED", "T99-testonly-02", "LASTONE",  "UNPAIRED", "", 1460613155001L) , driver);

		policySelectionCriteria.setUseability(DslConstants.UNPAIRED);
		Map<String, AsyncMessageaAnalyzerResult> asyncResultsMap = dhApi.asyncMessageAnalyzerPrintResults(policySelectionCriteria, DslConstants.USED, driver);

		System.out.println( "    asyncLifeCycleTestWithUseabilityUpdate matching pairs (updated) (" + asyncResultsMap.size() + ")" );		
	    System.out.println( "    -------------------------------------- ");	
		for (Map.Entry<String, AsyncMessageaAnalyzerResult> asyncResult: asyncResultsMap.entrySet()) {
		    System.out.println( "   | " + asyncResult.getKey() + " | " + asyncResult.getValue() + " |");
		}	
	    System.out.println( "    -------------------------------------- ");	
	    
	    assertEquals("asyncMessageAnalyzerPrintResults_1", "[application= TESTAPI_ASYNC_TOUSED, aStartOrEqr= null, identifier= T99-testonly-01, lifecycle= null, useability= USED, selectOrder= null], starttm= 1460613152000, endtm= 1460613153001, differencetm= 1001]", asyncResultsMap.get("TESTAPI_ASYNC_TOUSED:T99-testonly-01").toString());
	    assertEquals("asyncMessageAnalyzerPrintResults_2", "[application= TESTAPI_ASYNC_TOUSED, aStartOrEqr= null, identifier= T99-testonly-02, lifecycle= null, useability= USED, selectOrder= null], starttm= 1460613153000, endtm= 1460613155001, differencetm= 2001]", asyncResultsMap.get("TESTAPI_ASYNC_TOUSED:T99-testonly-02").toString()); 	    
	    assertEquals("printSelectedPolicies ", 2, asyncResultsMap.size()); 				
	    
		for (AsyncMessageaAnalyzerResult  pairedAsyncTxn : asyncResultsMap.values() ) {
			// example of a typical transaction name you could set (and its response time)
			System.out.println( "    Txn Name :  "  + pairedAsyncTxn.getApplication() + "_" + pairedAsyncTxn.getIdentifier() + "  Respsonse time (Assumed msecs) : "  + pairedAsyncTxn.getDifferencetm()  );				
		}
	    System.out.println( "    -------------------------------------------- ");	
	    
//		end of async processing, clean up data ....    
		policySelectionCriteria.setApplication("TESTAPI_ASYNC_TOUSED");
		policySelectionCriteria.setIdentifier(null);
		policySelectionCriteria.setLifecycle(null);		
		policySelectionCriteria.setUseability(DslConstants.UNSELECTED);	
		dhApi.deleteMultiplePolicies(policySelectionCriteria, driver);	
		assertEquals("CountPolicies count for TESTAPI_ASYNC_TOUSED  ", 0, (long)dhApi.countPolicies(policySelectionCriteria, driver)); 
		driver.close();	
		System.out.println( "\n<< Completed test asyncLifeCycleTestWithUseabilityUpdate - Demonstrate Async Processng with Useage Update\n" );			
	}
	
	
	/**
	 * Runs through the basic Data Hunter lifecycle. 
	 */
	@Test
	public void lifeCycleTestUsingSimpleDSL() throws FileNotFoundException, IOException{
		System.out.println( "\n\n>> Starting test lifeCycleTestUsingSimpleDSL\n" );				

		WebDriver driver = SeleniumWebdriverFactory.obtainWebDriver(SeleniumWebdriverFactory.CHROME);  // CHROME  ||  CHROME_HEADLESS
		
		PolicySelectionCriteria policySelectionCriteria = new PolicySelectionCriteria();
		policySelectionCriteria.setApplication("TESTAPI");
		policySelectionCriteria.setLifecycle(null);
		policySelectionCriteria.setUseability(null);	
		
		DirectPageGets directPageGets = new DirectPageGets(driver, DslConstants.DEFAULT_DATAHUNTER_URL, policySelectionCriteria.getApplication()); 
						
// 		delete multiple policies
		directPageGets.gotoDeleteMultiplePoliciesPage();
		DeleteMultiplePoliciesPage deleteMultiplePoliciesPage = new DeleteMultiplePoliciesPage(driver); 
		deleteMultiplePoliciesPage.lifecycle.type(policySelectionCriteria.getLifecycle());
		deleteMultiplePoliciesPage.submit.submit();
		
		DeleteMultiplePoliciesActionPage deleteMultiplePoliciesActionPage = new DeleteMultiplePoliciesActionPage(driver);
		assertEquals("DeleteMultiplePolicies result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, deleteMultiplePoliciesActionPage.sqlResult.getText()); 	
		
// 		add three 'new Business' policies
		Policies policy = new Policies(policySelectionCriteria.getApplication(), null, "new Business", DslConstants.UNUSED, "", 123456L);
		AddPolicyActionPage addPolicyActionPage;
		directPageGets.gotoAddPolicyPage();
		AddPolicyPage addPolicyPage = new AddPolicyPage(driver);
		
		for (int i = 1; i <= 3; i++) {
			policy.setIdentifier("TESTID" + i);
			policy.setEpochtime(System.currentTimeMillis());			
			addPolicyPage = new AddPolicyPage(driver);
			addPolicyPage.identifier.type(policy.getIdentifier());
			addPolicyPage.lifecycle.type(policy.getLifecycle());
			addPolicyPage.useability.selectByVisibleText(policy.getUseability());
			addPolicyPage.otherdata.type(policy.getOtherdata());		
			addPolicyPage.epochtime.type(policy.getEpochtime().toString());
			addPolicyPage.submit.submit();	
			addPolicyActionPage = new AddPolicyActionPage(driver);
			assertEquals("AddPolicyPage ("+ i + ") result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, addPolicyActionPage.sqlResult.getText()); 	
			
			addPolicyActionPage.backLink.click();
			try {	Thread.sleep(1000);	} catch (InterruptedException e) {e.printStackTrace();	}
			addPolicyPage = new AddPolicyPage(driver);				
		} 
		
// 		count policy
		policySelectionCriteria.setApplication("TESTAPI");		
		policySelectionCriteria.setLifecycle("new Business");
		policySelectionCriteria.setUseability("UNUSED");
		
		directPageGets.gotoCountPoliciesPage();
		CountPoliciesPage countPoliciesPage = new CountPoliciesPage(driver); 
		countPoliciesPage.lifecycle.type(policySelectionCriteria.getLifecycle());
		countPoliciesPage.useability.selectByVisibleText(policySelectionCriteria.getUseability());
		countPoliciesPage.submit.submit();
		
		CountPoliciesActionPage countPoliciesActionPage = new CountPoliciesActionPage(driver);	
		assertEquals("CountPoliciesActionPage result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, countPoliciesActionPage.sqlResult.getText()); 
		String scount = countPoliciesActionPage.rowsAffected.getText();
		assertEquals("CountPoliciesActionPage incorrect policy count for TESTAPI, new Business, UNUSED.", "3", scount); 		
		
// 		count breakdown		
		directPageGets.gotoCountPoliciesBreakdownPage();
		CountPoliciesBreakdownPage countPoliciesBreakdownPage = new CountPoliciesBreakdownPage(driver);
		countPoliciesBreakdownPage.lifecycle.type(policySelectionCriteria.getLifecycle());
		countPoliciesBreakdownPage.useability.selectByVisibleText(policySelectionCriteria.getUseability());
		countPoliciesBreakdownPage.submit.submit();
		
		CountPoliciesBreakdownActionPage countPoliciesBreakdownActionPage = new CountPoliciesBreakdownActionPage(driver);	
		assertEquals("countPoliciesBreakdownActionPage result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, countPoliciesBreakdownActionPage.sqlResult.getText()); 
		int icount = countPoliciesBreakdownActionPage.getCountForBreakdown("TESTAPI", "new Business", "UNUSED" ); 
		assertEquals("CountPoliciesActionPage incorrect policy count for TESTAPI, new Business, UNUSED.", 3, icount); 			
		
//		lookup next policy
		policySelectionCriteria.setSelectOrder(DslConstants.SELECT_MOST_RECENTLY_ADDED);
		
		directPageGets.gotoNextPolicyPage(DslConstants.LOOKUP);
		NextPolicyPage nextPolicyPage = new NextPolicyPage(driver); 
		nextPolicyPage.lifecycle.type(policySelectionCriteria.getLifecycle());
		nextPolicyPage.useability.selectByVisibleText(policySelectionCriteria.getUseability());
		nextPolicyPage.selectOrder.selectByVisibleText(policySelectionCriteria.getSelectOrder());
		nextPolicyPage.submit.submit();
		
		NextPolicyActionPage nextPolicyActionPage = new NextPolicyActionPage(driver);		
		assertEquals("nextPolicyActionPage result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, nextPolicyActionPage.sqlResult.getText()); 		
		
		Policies lookupPolicy = new Policies();
		lookupPolicy.setApplication(nextPolicyActionPage.application.getText());
		lookupPolicy.setIdentifier(nextPolicyActionPage.identifier.getText());
		lookupPolicy.setLifecycle(nextPolicyActionPage.lifecycle.getText());
		lookupPolicy.setUseability(nextPolicyActionPage.useability.getText());			
		lookupPolicy.setOtherdata(nextPolicyActionPage.otherdata.getText());
		lookupPolicy.setCreated(Timestamp.valueOf(nextPolicyActionPage.created.getText()));
		lookupPolicy.setUpdated(Timestamp.valueOf(nextPolicyActionPage.updated.getText()));
		lookupPolicy.setEpochtime(new Long(nextPolicyActionPage.epochtime.getText()));			
		System.out.println( "    lookupNextPolicy : " + lookupPolicy);
		assertTrue("lookupNextPolicy", lookupPolicy.toString().startsWith("[application=TESTAPI, identifier=TESTID3, lifecycle=new Business, useability=UNUSED, otherdata=,")); 		
		
//		use next policy
		policySelectionCriteria.setSelectOrder(DslConstants.SELECT_MOST_RECENTLY_ADDED);
		directPageGets.gotoNextPolicyPage(DslConstants.USE);
		nextPolicyPage = new NextPolicyPage(driver); 
		nextPolicyPage.lifecycle.type(policySelectionCriteria.getLifecycle());
		nextPolicyPage.useability.selectByVisibleText(policySelectionCriteria.getUseability());
		nextPolicyPage.selectOrder.selectByVisibleText(policySelectionCriteria.getSelectOrder());
		nextPolicyPage.submit.submit();
		nextPolicyActionPage = new NextPolicyActionPage(driver);		
		assertEquals("nextPolicyActionPage result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, nextPolicyActionPage.sqlResult.getText()); 		
		
		Policies usePolicy = new Policies();
		usePolicy.setApplication(nextPolicyActionPage.application.getText());
		usePolicy.setIdentifier(nextPolicyActionPage.identifier.getText());
		usePolicy.setLifecycle(nextPolicyActionPage.lifecycle.getText());
		usePolicy.setUseability(nextPolicyActionPage.useability.getText());			
		usePolicy.setOtherdata(nextPolicyActionPage.otherdata.getText());
		usePolicy.setCreated(Timestamp.valueOf(nextPolicyActionPage.created.getText()));
		usePolicy.setUpdated(Timestamp.valueOf(nextPolicyActionPage.updated.getText()));
		usePolicy.setEpochtime(new Long(nextPolicyActionPage.epochtime.getText()));			
		System.out.println( "    lookupNextPolicy : " + lookupPolicy);
		assertTrue("useNextPolicy", usePolicy.toString().startsWith("[application=TESTAPI, identifier=TESTID3, lifecycle=new Business, useability=UNUSED, otherdata=,")); 		
		
// 		delete multiple policies (test cleanup)
		directPageGets.gotoDeleteMultiplePoliciesPage();
		deleteMultiplePoliciesPage = new DeleteMultiplePoliciesPage(driver); 
		deleteMultiplePoliciesPage.submit.submit();
		
		deleteMultiplePoliciesActionPage = new DeleteMultiplePoliciesActionPage(driver);
		assertEquals("DeleteMultiplePolicies result should of been PASS but isn't.", DslConstants.SQL_RESULT_PASS, deleteMultiplePoliciesActionPage.sqlResult.getText()); 	
		scount = deleteMultiplePoliciesActionPage.rowsAffected.getText();
		assertEquals("DeleteMultiplePolicies 3 rows should of been deleted", "3", scount); 		

		driver.close();
		System.out.println( "\n\n<< Completed test lifeCycleTestUsingSimpleDSL\n" );	
	}	
	

	/**
	 * Demonstrates capture of the timing of async events using Datahunter (but not doing the useabiltiy update). 
	 * The status of the pairs of policy rows are the updated using the UpdateUseStateAndEpochTime page.     
	 */
	@Test
	public void asyncLifeCycleTestAndUpdateUseStateAndEpochTimePage() throws FileNotFoundException, IOException{		
		System.out.println( "\n\n>> Starting test asyncLifeCycleTestAndUpdateUseStateAndEpochTimePage - Demonstrate UpdateUseStateAndEpochTime Usage\n" );			
		
		DslPageFunctions dhApi = new DslPageFunctions(DslConstants.DEFAULT_DATAHUNTER_URL);
		
		WebDriver driver = SeleniumWebdriverFactory.obtainWebDriver(SeleniumWebdriverFactory.CHROME );  // CHROME  ||  CHROME_HEADLESS
		PolicySelectionCriteria policySelectionCriteria = new PolicySelectionCriteria();		
		
//		test_paired_message_analyzer  (then  update_usability)
		policySelectionCriteria.setApplicationStartsWithOrEquals(DslConstants.EQUALS);		
		policySelectionCriteria.setApplication("TESTAPI_ASYNC");
		policySelectionCriteria.setIdentifier(null);
		policySelectionCriteria.setLifecycle(null);		
		policySelectionCriteria.setUseability(DslConstants.UNSELECTED);	
		dhApi.deleteMultiplePolicies(policySelectionCriteria, driver);	

		dhApi.addPolicy( new Policies("TESTAPI_ASYNC", "T99-testonly-01", "FIRSTONE", "UNPAIRED", "", 1460613152000L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC", "T99-testonly-01", "between",  "UNPAIRED", "", 1460613152009L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC", "T99-testonly-01", "LASTONE",  "UNPAIRED", "", 1460613153001L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC", "T99-testonly-02", "FIRSTONE", "UNPAIRED", "", 1460613152000L) , driver);
		dhApi.addPolicy( new Policies("TESTAPI_ASYNC", "T99-testonly-02", "LASTONE",  "UNPAIRED", "", 1460613154001L) , driver);

		policySelectionCriteria.setUseability(DslConstants.UNPAIRED);
		Map<String, AsyncMessageaAnalyzerResult> asyncResultsMap = dhApi.asyncMessageAnalyzerPrintResults(policySelectionCriteria, DslConstants.UNSELECTED, driver);

		System.out.println( "    asyncLifeCycleTestAndUpdateUseStateAndEpochTimePage - matched keys (" + asyncResultsMap.size() + ")" );		
	    System.out.println( "    --------------------------------------------------- ");	
		for (Map.Entry<String, AsyncMessageaAnalyzerResult> asyncResult: asyncResultsMap.entrySet()) {
		    System.out.println( "   | " + asyncResult.getKey() + " | " + asyncResult.getValue() + " |");
		}	
	    System.out.println( "    --------------------------------------------------- ");	
	    
		assertEquals("asyncMessageAnalyzerPrintResults_1", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-01, lifecycle= null, useability= UNPAIRED, selectOrder= null], starttm= 1460613152000, endtm= 1460613153001, differencetm= 1001]", asyncResultsMap.get("TESTAPI_ASYNC:T99-testonly-01").toString());
		assertEquals("asyncMessageAnalyzerPrintResults_2", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-02, lifecycle= null, useability= UNPAIRED, selectOrder= null], starttm= 1460613152000, endtm= 1460613154001, differencetm= 2001]", asyncResultsMap.get("TESTAPI_ASYNC:T99-testonly-02").toString()); 	    
	    assertEquals("printSelectedPolicies ", 2, asyncResultsMap.size()); 				
	    
	    
//		ok, now lets go thru the map (values) of the current UNPAIRED transactions again, but this time mark them as USED using the UpdateUseStateAndEpochTime page.  
//	    Could be used for ansync transactions in a low-volume test scenario - but always use the DataHunter REST API when possible.
		
	    UpdateUseStateAndEpochTime updateUseStateAndEpochTime = new UpdateUseStateAndEpochTime();
	    updateUseStateAndEpochTime.setApplication("TESTAPI_ASYNC");
	    updateUseStateAndEpochTime.setUseability(DslConstants.UNPAIRED );
	    updateUseStateAndEpochTime.setToUseability("USED");
	    updateUseStateAndEpochTime.setToEpochTime(null);  	    
	    
		policySelectionCriteria.setUseability(DslConstants.UNPAIRED);
		Map<String, AsyncMessageaAnalyzerResult> pairedAsyncTransactionsMap = dhApi.asyncMessageAnalyzerPrintResults(policySelectionCriteria, DslConstants.UNSELECTED, driver);

		assertEquals("asyncMessageAnalyzerPrintResults_1", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-01, lifecycle= null, useability= UNPAIRED, selectOrder= null], starttm= 1460613152000, endtm= 1460613153001, differencetm= 1001]", pairedAsyncTransactionsMap.get("TESTAPI_ASYNC:T99-testonly-01").toString());
		assertEquals("asyncMessageAnalyzerPrintResults_2", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-02, lifecycle= null, useability= UNPAIRED, selectOrder= null], starttm= 1460613152000, endtm= 1460613154001, differencetm= 2001]", pairedAsyncTransactionsMap.get("TESTAPI_ASYNC:T99-testonly-02").toString()); 	    
	    assertEquals("printSelectedPolicies ", 2, asyncResultsMap.size()); 				
		assertEquals("printSelectedPolicies ", 2, pairedAsyncTransactionsMap.size()); 				

		for (AsyncMessageaAnalyzerResult  pairedAsyncTxn : pairedAsyncTransactionsMap.values() ) {
			// example of the transaction name to set (and its response time)
			System.out.println( "    Txn Name :  "  + pairedAsyncTxn.getApplication() + "_" + pairedAsyncTxn.getIdentifier() + "  Respsonse time (Assumed msecs) : "  + pairedAsyncTxn.getDifferencetm()  );				
			
			// once reported, the transaction rows should then be marked as used ..
			updateUseStateAndEpochTime.setIdentifier(pairedAsyncTxn.getIdentifier());
		    //updateUseStateAndEpochTime.setToEpochTime(System.currentTimeMillis());  //optional, epoch time to null to leave it as is   				
		    dhApi.updatePoliciesUseState(updateUseStateAndEpochTime, driver);
		}
	    System.out.println( "    ---------------------------------------------------------------------------------\n");	
		    
		policySelectionCriteria.setUseability(DslConstants.USED);	
		asyncResultsMap = dhApi.asyncMessageAnalyzerPrintResults(policySelectionCriteria, DslConstants.UNSELECTED, driver);
	    System.out.println( "    asyncLifeCycleTestAndUpdateUseStateAndEpochTimePage - after going thru all UNPARIED policies and setting them to USED  (" + asyncResultsMap.size() + ")" );		
	    System.out.println( "    --------------------------------------------------- ");	
		for (Map.Entry<String, AsyncMessageaAnalyzerResult> asyncResult: asyncResultsMap.entrySet()) {
		    System.out.println( "   | " + asyncResult.getKey() + " | " + asyncResult.getValue() + " |");
		}	
	    System.out.println( "    --------------------------------------------------- ");	
  
	    assertEquals("asyncMessageAnalyzerPrintResults_1", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-01, lifecycle= null, useability= USED, selectOrder= null], starttm= 1460613152000, endtm= 1460613153001, differencetm= 1001]", asyncResultsMap.get("TESTAPI_ASYNC:T99-testonly-01").toString());
	    assertEquals("asyncMessageAnalyzerPrintResults_2", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-02, lifecycle= null, useability= USED, selectOrder= null], starttm= 1460613152000, endtm= 1460613154001, differencetm= 2001]", asyncResultsMap.get("TESTAPI_ASYNC:T99-testonly-02").toString()); 	    
	    assertEquals("printSelectedPolicies ", 2, asyncResultsMap.size()); 				
    
//		end of Async processing    
//		while we are here, we'll do a bit more testing few more tests (unrelated to async) ....  test update of multiple policies Use State works  ok 	    

	    // update_usability to "REUSABLE"	    
	    updateUseStateAndEpochTime.setApplication("TESTAPI_ASYNC");
	    updateUseStateAndEpochTime.setIdentifier(null);
	    updateUseStateAndEpochTime.setUseability(DslConstants.USED );
	    updateUseStateAndEpochTime.setToUseability(DslConstants.REUSABLE);
	    updateUseStateAndEpochTime.setToEpochTime(null);
	    
	    dhApi.updatePoliciesUseState(updateUseStateAndEpochTime, driver);	    

		policySelectionCriteria.setUseability(DslConstants.REUSABLE);	
		asyncResultsMap = dhApi.asyncMessageAnalyzerPrintResults(policySelectionCriteria, DslConstants.UNSELECTED, driver);
	    System.out.println( "    asyncLifeCycleTestAndUpdateUseStateAndEpochTimePage - after re-setting all the USED polices to REUSABLE for multiple policy test  (" + asyncResultsMap.size() + ")" );		
	    System.out.println( "    --------------------------------------------------- ");	
		for (Map.Entry<String, AsyncMessageaAnalyzerResult> asyncResult: asyncResultsMap.entrySet()) {
		    System.out.println( "   | " + asyncResult.getKey() + " | " + asyncResult.getValue() + " |");
		}	
	    System.out.println( "    --------------------------------------------------- ");	
  
		assertEquals("asyncMessageAnalyzerPrintResults_1", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-01, lifecycle= null, useability= REUSABLE, selectOrder= null], starttm= 1460613152000, endtm= 1460613153001, differencetm= 1001]", asyncResultsMap.get("TESTAPI_ASYNC:T99-testonly-01").toString());
		assertEquals("asyncMessageAnalyzerPrintResults_2", "[application= TESTAPI_ASYNC, aStartOrEqr= null, identifier= T99-testonly-02, lifecycle= null, useability= REUSABLE, selectOrder= null], starttm= 1460613152000, endtm= 1460613154001, differencetm= 2001]", asyncResultsMap.get("TESTAPI_ASYNC:T99-testonly-02").toString()); 	    
		assertEquals("printSelectedPolicies ", 2, asyncResultsMap.size()); 				
	    	    
//		remove data
		policySelectionCriteria.setApplication("TESTAPI_ASYNC");
		policySelectionCriteria.setIdentifier(null);
		policySelectionCriteria.setLifecycle(null);		
		policySelectionCriteria.setUseability(DslConstants.UNSELECTED);	
		dhApi.deleteMultiplePolicies(policySelectionCriteria, driver);	
		assertEquals("CountPolicies count for TESTAPI, new Business, UNUSED  ", 0, (long)dhApi.countPolicies(policySelectionCriteria, driver)); 
		driver.close();	
		System.out.println( "\n<< Completed test asyncLifeCycleTestAndUpdateUseStateAndEpochTimePage\n\n" );			
	}
		
}
