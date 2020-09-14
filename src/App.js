import React ,  { useState, useEffect} from 'react';
import './App.css';
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { FormControl, Select, MenuItem, Card , CardContent, } from '@material-ui/core';
import {sortData, prettyPrintStat} from "./utill";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {
  const [countries ,setCouintries] = useState([]);
  const [country ,setCountry] = useState("worldwide");
  const [countryInfo , setCountryInfo] = useState({});
  const [tableData , setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries , setMapcountries]= useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {

    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })

  },[])



useEffect(() => {

  const getCountriesData = async ()=>{

    await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response)=> response.json())
    .then((data) => {
      const countries = data.map((country)=>(
        {
          name: country.country,
          value: country.countryInfo.iso2,
        }

      ));

      const sortedDatra= sortData(data);

      setCouintries(countries);
      setTableData(sortedDatra);
      setMapcountries(data);

    });
  };

getCountriesData();

},[]);

const onCountryChange = async (e)=>{
  const countryCode = e.target.value;

  setCountry(countryCode);

  const url =
  countryCode === "worldwide"
    ? "https://disease.sh/v3/covid-19/all"
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
  .then(data=>{

    setCountry(countryCode);
    setCountryInfo(data);
    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    setMapZoom(4);
  })



}



  

  return (
    <div className="app">

      <div className="app__left">

      <div className="app__header">

            <h1>COVID-19 TRACKER</h1>

            <FormControl className="app__dropdown">
                      <Select
                          variant="outlined"
                          value={country}
                          onChange={onCountryChange}

             >
            <MenuItem value="worldwide">Worldwide</MenuItem>
                    {countries.map((country) => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))}




                        </Select >
              </FormControl>
  
</div>

<div className="app__status">
          <InfoBox
            isRed
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
           
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            isRed
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
        
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>

          <Table countries={tableData}/>


          <h3>Word wide new {casesType} </h3>
          <LineGraph className="app__graph" casesType={casesType} />


        </CardContent>

        

      </Card>

      
      
     
    </div>
  );
}

export default App;
