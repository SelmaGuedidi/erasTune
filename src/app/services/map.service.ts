import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';



@Injectable({
  providedIn: 'root'
})

export class MapService {
  private countriesGroup: any;

  
  constructor(private http: HttpClient) { }

  loadMapData(windowWidth, windowHeight): void {
    this.http.get('https://raw.githubusercontent.com/SelmaGuedidi/ErasTune/dev/src/assets/maps/world_2010.geojson')
      .subscribe((json: any) => {
        this.drawMap(json,windowWidth, windowHeight);
      });
  }

  private drawMap(json: any,windowWidth, windowHeight): void {
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

     .call(d3.zoom().scaleExtent([1, 20]).translateExtent([[0, 0], [w+200, h+250]]).on('zoom', this.zoomed.bind(this)))
      .append('g')
     
      ;
  let body=d3.select("body")
  .style("width", w)
  .style("height", h+200)
  .style("margin", "0")
  .style("padding", "0");
  const countryColors = ['#fce4c4', '#fbf3dc', '#fbd4c3', '#cce4d4','#e6e1ce'];
  let currentColor = '#7cc0d8';
      
    this.countriesGroup.append('rect').attr('x', 0).attr('y', 0).attr('width', w+40).attr('height', h+150).attr('fill', (d: any) => {
   
      return '#7cc0d8';
    });
    console.log(json.features)
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
      .attr('id', (d: any) => { console.log(d.properties.NAME);return 'country' + d.properties.NAME?d.properties.NAME:""})
      .attr('class', 'country')
      .on('mouseover', (event, d: any) => {
        const countryName = d.properties.NAME ? d.properties.NAME : '';
        this.showTooltip(countryName, event);
        const hoveredCountryId = 'country' + d.properties.NAME;
        d3.select(`#${hoveredCountryId}`).attr('fill', '#f4bcbc');
      })
      .on('click', (d: any) => {
        console.log("click");
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
}