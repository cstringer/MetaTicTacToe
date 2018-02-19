import $ from 'jquery';
import Dom from './MT3Dom';
import Main from './MT3Main';
import './style.css';

Main.setDom(Dom);
$(document).ready(Main.init);
