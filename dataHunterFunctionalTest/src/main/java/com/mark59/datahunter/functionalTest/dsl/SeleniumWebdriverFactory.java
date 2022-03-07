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

package com.mark59.datahunter.functionalTest.dsl;

import java.io.File;
import java.io.IOException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;

/**
 * @author Philip Webb
 * Written: Australian Winter 2019
 */
public final class SeleniumWebdriverFactory {

	public static String CHROME = "CHROME";
	public static String CHROME_HEADLESS = "CHROME_HEADLESS";	

	private static String chromedriverPath; 
	private static ChromeDriverService CHROME_DRIVER_SERVICE; 
	
	
	private static enum OS {
		WINDOWS("WINDOWS"), LINUX("LINUX"), UNIX("UNIX"), UNKNOWN("UNKNOWN");
		private String osName;
		OS(String osName) {	this.osName = osName;}
		public String getOsName() {return osName;}
	}
	
	
	public static WebDriver obtainWebDriver(String parmDrivertype ){

		String operatingSystem = System.getProperty("os.name",OS.UNKNOWN.getOsName());
		System.out.println("   Operating system : " + operatingSystem);
		
		if ( operatingSystem.toUpperCase().contains("WIN")) {
			chromedriverPath = "./chromedriver.exe";
		} else {
			chromedriverPath = "./chromedriver";
		}

		CHROME_DRIVER_SERVICE = new ChromeDriverService.Builder().usingDriverExecutable(new File(chromedriverPath)).build();

		System.out.println("   Chrome driver path = " + chromedriverPath + "),  mode = " + parmDrivertype);
		System.out.println("   Chrome Driver Service Status :  Running = " + CHROME_DRIVER_SERVICE.isRunning()  );
		ChromeOptions chromeOptions = new ChromeOptions();

		if (CHROME.equalsIgnoreCase(parmDrivertype)){  
			chromeOptions.addArguments("start-maximized");

		} else if (CHROME_HEADLESS.equalsIgnoreCase(parmDrivertype)){
			chromeOptions.addArguments("--headless", "-window-size=1920,1080");
		
		} else {
			throw new RuntimeException("INVALID DRIVER TYPE : " +  parmDrivertype );
		}
		
		WebDriver driver = new ChromeDriver(CHROME_DRIVER_SERVICE, chromeOptions);
		return driver;

	}

	
	/**
	 * Singleton pattern to get a ChromeDriverService (if required).   Example of call:
	 * <p><code>
	 * 		ChromeOptions chromeOptions = new ChromeOptions();<br>
	 *		chromeOptions.addArguments("start-maximized");<br>
	 *		driver = new ChromeDriver(ChromeDriverServiceHolder.getInstance(), chromeOptions); 
	 * </code> 	
	 */
	public static class ChromeDriverServiceHolder  {
	    private static ChromeDriverService chromeDriverServiceInstance = null;
	    private ChromeDriverServiceHolder(){}
	    public static synchronized ChromeDriverService getInstance() {
	        if ( chromeDriverServiceInstance == null ) {
	        	chromeDriverServiceInstance = new ChromeDriverService.Builder().usingDriverExecutable(new File(chromedriverPath)).build();
	        	try {
					chromeDriverServiceInstance.start();
				} catch (IOException e) {
					e.printStackTrace();
					throw new RuntimeException("Unable to staryt the ChromeDriverService! " + e.getMessage());
				}
	        }
	        return chromeDriverServiceInstance;
	    }
	}
	
	
}
