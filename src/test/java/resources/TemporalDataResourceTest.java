package resources;

import app.Application;
import app.ApplicationConfiguration;
import core.TemporalData;
import core.TemporalValue;
import data.CsvDAO;
import io.dropwizard.testing.junit.DropwizardAppRule;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static org.junit.Assert.assertTrue;

/**
 * Created by evolution on 19/02/2015.
 */
public class TemporalDataResourceTest {
    private static final Logger logger = LoggerFactory.getLogger(TemporalDataResourceTest.class);


    private static String data = "src/test/resources/data/test.csv";
    private static String spec = "src/test/resources/data/test.xml";


    @ClassRule
    public static final DropwizardAppRule<ApplicationConfiguration> RULE =
            new DropwizardAppRule<ApplicationConfiguration>(Application.class, "configuration.yml");

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder()
            .addResource(new TemporalDataResource(CsvDAO.getInstance(data, spec)))
            .build();

    @Test
    public void testReadColumnWithGranularityMinutes() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=minute").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==4);

        //test individual aggregations on the minutes level
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 1.5);
        assertTrue(temporalData.getColumns().get(0).getValues().get(1).getColumn()==6);
        assertTrue(temporalData.getColumns().get(0).getValues().get(2).getColumn()==2.5);
        assertTrue(temporalData.getColumns().get(0).getValues().get(3).getColumn()==1);

    }

    @Test
    public void testReadColumnWithGranularityHours() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=hour").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==3);

        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 3.75);
        assertTrue(temporalData.getColumns().get(0).getValues().get(1).getColumn() == 2.5);
        assertTrue(temporalData.getColumns().get(0).getValues().get(2).getColumn() == 1);
    }

    @Test
    public void testReadColumnWithGranularityDays() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=day").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==2);

        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 3.75);
        assertTrue(temporalData.getColumns().get(0).getValues().get(1).getColumn() == 1.75);
    }

    @Test
    public void testReadColumnWithGranularityTop() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=top").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==1);

        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 2.75);
    }

    @Test
    public void testSingleQualityHWithTop(){
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=top").get(TemporalData.class);
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getQuality()==0);
    }

    @Test
    public void testSingleQualityOfHWithMinutes(){
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=day").get(TemporalData.class);
        List<TemporalValue> values = temporalData.getColumns().get(0).getValues();
        for(int i=0; i<values.size(); i++) {
            assertTrue(values.get(i).getQuality() == 0);
        }
    }

    @Test
    public void testSingleQualityOf(){
        TemporalData temporalData = resources.client().resource("/get-data?column=w&granularity=top").get(TemporalData.class);
        logger.info("quality ISSSS: "+temporalData.getColumns().get(0).getValues().get(0).getQuality());
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getQuality() ==   0.35416666666666663);

    }


    @Test
    public void testReadAllWithGranularity() {
        TemporalData temporalData = resources.client().resource("/get-data?granularity=minute").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==4);
        double qualityOfLast = temporalData.getColumns().get(0).getValues().get(3).getQuality();
        logger.info("quality of last: "+qualityOfLast);
        assertTrue(qualityOfLast>0.37);
    }

}
