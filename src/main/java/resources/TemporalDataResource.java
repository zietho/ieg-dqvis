package resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Optional;
import core.TemporalColumn;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import prefuse.data.column.Column;
import timeBench.data.TemporalDataset;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * Created by evolution on 10/07/2014.
 */
@Path("/get-data")
@Produces(MediaType.APPLICATION_JSON)
public class TemporalDataResource {
    public TemporalDataset data;
    final Logger logger = LoggerFactory.getLogger(TemporalDataResource.class);

    public TemporalDataResource(TemporalDataset data){
        this.data = data;
        logger.info("{} data sets loaded", data.getRootCount());
    }

    @GET
    @Timed
    public List<TemporalColumn> readData(@QueryParam("column") String column, @QueryParam("granularity") Optional<String> granularity){
        core.TemporalData temporalData = new core.TemporalData();

        if(column != null && !column.equals("")){
            //first get the column and convert it to an array list
            Column dataColumn = data.getTemporalObjectTable().getColumn(column);
            Column missingDataColumn = data.getTemporalObjectTable().getColumn(column+".MissingData");
            Column invalidDataColumn = data.getTemporalObjectTable().getColumn(column+".InvalidData");

            for(int i=0; i<dataColumn.getRowCount(); i++){
                double dataValue = (double) dataColumn.get(i);
                int qualityValue = (missingDataColumn.get(i).toString().equals("1") || invalidDataColumn.get(i).toString().equals("1")) ? 1 : 0;
                long dateValue = data.getTemporalElements().getTemporalElementByRow(i).getInf();

//                data.getTemporalElements().getTemporalElementByRow(i).getInf();  fuer timestmap
                TemporalColumn temporalColumn = new TemporalColumn(dateValue, dataValue, qualityValue);
                temporalData.add(temporalColumn);
            }
        }

        return temporalData.getData();
    }

}
