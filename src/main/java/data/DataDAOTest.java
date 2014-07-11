package data;

import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import prefuse.data.io.DataIOException;
import timeBench.calendar.Calendar;
import timeBench.calendar.CalendarManager;
import timeBench.calendar.Granularity;
import timeBench.data.TemporalDataException;
import timeBench.data.TemporalDataset;

import javax.xml.bind.JAXBException;
import java.io.IOException;
import java.util.Collections;
import java.util.GregorianCalendar;
import java.util.List;

/**
 * Created by evolution on 08/07/2014.
 */
public class DataDAOTest {

    public static void main(String args[]){
        final String data = "src/main/resources/data/01_raw_data_set1_preprocessed_markus.csv";
        final String spec = "src/main/resources/data/spec2.xml";
        TemporalDataset drillingData = null;

        try {
            DataDAO dataDAO = new DataDAO(data,spec);
            drillingData = dataDAO.read();
            System.out.println("finished");
        } catch (DataIOException e) {
            e.printStackTrace();
        } catch (TemporalDataException e) {
            e.printStackTrace();
        } catch (JAXBException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }



    }
}
