package data;

import core.Schema;
import core.TemporalColumn;
import core.TemporalData;
import timeBench.data.GranularityAggregationTree;
import timeBench.data.TemporalDataset;

public interface DataDAO{


    /**
     * Method to read the data source without params
     * @return
     */
    public Object readData();

    public TemporalData read();

    /**
     * Method to read / get a single data column from a data source
     * @param column
     * @return
     */
    public TemporalColumn read(String column);

    /**
     * A method to retrieve only a slice of the whole data set.
     * @param fomIndex
     * @param toIndex
     * @return
     */
    public TemporalData readTimeSlice(int fomIndex, int toIndex);

    /**
     *
     * @param fromIndex
     * @param toIndex
     * @param column
     * @return
     */
    public TemporalColumn readTimeSlice(int fromIndex, int toIndex, String column);

    /**
     *
     * @return
     */
    public GranularityAggregationTree aggregate();

    /**
     *
     * @return
     */
    public Schema getColumnNames();

    public Object getDataset();
}