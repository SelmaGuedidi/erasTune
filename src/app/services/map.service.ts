import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';
import { MusicPlayerService } from './music-player.service';

import { ToastrService } from 'ngx-toastr';





@Injectable({
  providedIn: 'root'
})

export class MapService {
  private countriesGroup: any;

  countryClickedSource = new BehaviorSubject<string[] | null>(null);
countryClicked$ = this.countryClickedSource.asObservable(); 
  
  decadeClickedSource = new BehaviorSubject<number>(1980);
  decadeClicked$ = this.decadeClickedSource.asObservable();

  country_to_json={
    "1950":"1945",
    "1960":"1960",
    "1970":"1960",
    "1980":"1960",
    "1990":"1994",
    "2000":"2000",
    "2010":"2010",

  }
  decade:number=1980
  constructor(private http: HttpClient, private toast: ToastrService) {
    
  }
  
  musicPlayerService = inject(MusicPlayerService);
  
  loadMapData(value,windowWidth, windowHeight): void {
    // Use the latest value from decadeClicked$ in the URL
    console.log(`world_${this.country_to_json[value]}.geojson`)
    this.http
      .get(`https://raw.githubusercontent.com/SelmaGuedidi/ErasTune/dev/src/assets/maps/world_${this.country_to_json[value]}.geojson`)
      .subscribe((json: any) => {
        this.drawMap(json, windowWidth, windowHeight);
      });
  }
  removePrevMap():void{
    const mapHolder = d3.select('#map-holder');
    mapHolder.select('svg').remove();
  }

  private drawMap(json: any,windowWidth, windowHeight): void {
    this.removePrevMap()
    const w = 1650;
    const h = 750;

    const projection = d3.geoEquirectangular()
      .center([0, 15])
      .scale(w / (2 * Math.PI))
      .translate([w / 2, h / 2]);

    const path = d3.geoPath().projection(projection);




    this.countriesGroup = d3.select('#map-holder')
    .attr('width', w)
    .attr('height', h)
    .style("overflow", "hidden")
      .append('svg')
      .attr('width', w)
      .attr('height', h+100)

     .call(d3.zoom().scaleExtent([1, 20]).translateExtent([[0, 0], [w+200, h+220]]).on('zoom', this.zoomed.bind(this)))
      .append('g')

      ;
  let body=d3.select("body")
  .style("width", w)
  .style("height", h+200)
  .style("margin", "0")
  .style("padding", "0");
  const countryColors = ['#fce4c4', '#fbf3dc', '#fbd4c3', '#cce4d4','#e6e1ce'];


    this.countriesGroup.append('rect').attr('x', 0).attr('y', 0).attr('width', w+40).attr('height', h+150).attr('fill', (d: any) => {

      return '#7cc0d8';
    });
    // console.log(json.features)
    const countries = this.countriesGroup.selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('fill', (d: any) => {

        const randomColor = countryColors[Math.floor(Math.random() * countryColors.length)];
    return randomColor;
      })
      .style('stroke', '#2A2C39') // Set the stroke color
  .style('stroke-width', '0.5')
      .attr('d', (d: any) => path(d) as string)
      .attr('id', (d: any) => { /*console.log(d.properties.NAME);return 'country' + d.properties.NAME?d.properties.NAME:""*/})
      .attr('class', 'country')
      .on('mouseover', (event, d: any) => {
        const countryName = d.properties.NAME ? d.properties.NAME : '';
        this.showTooltip(countryName, event);
        const hoveredCountryId = 'country' + d.properties.NAME;
        d3.select(`#${hoveredCountryId}`).attr('fill', '#f4bcbc');
      })
      .on('click', (d: any) => {
        var countryABBREVN = d.srcElement.__data__.properties.ABBREVN ? d.srcElement.__data__.properties.ABBREVN : ''
        if (countryABBREVN == ''){

          this.toast.error("coutnry not found")       
        
        }
        else {
          console.log("acessing music player service in", this.decadeClickedSource.value ,"for ",countryABBREVN);``
          var countryName = d.srcElement.__data__.properties.NAME ? d.srcElement.__data__.properties.NAME : ''
          // Define the observable without subscribing
          this.countryClickedSource.next([countryName,countryABBREVN]);
          // console.log(this.countryClicked$)
          // console.log(this.countryClickedSource)
        }

      })
      .on('mouseout', () => {
        this.hideTooltip();

      });



  }
  private zoomed(event: any): void {
    this.countriesGroup.attr('transform', event.transform);
  }
  private showTooltip(countryName: string, event: MouseEvent): void {
    const tooltip = d3.select('#tooltip');
    tooltip.html(countryName)
      .style('display', 'block')
      .style('left', (event.pageX ) + 'px')
      .style('top', (event.pageY ) + 'px');
  }

  // Function to hide tooltip
  private hideTooltip(): void {
    const tooltip = d3.select('#tooltip');
    tooltip.style('display', 'none');
  }
  decadeClicked (decade : number){
    this.decadeClickedSource.next(decade)
    // console.log(this.decadeClicked$)
    // console.log(this.decadeClickedSource)
    // this.musicPlayerService.getMusicByCountryAndYear(,decade)

  }
}