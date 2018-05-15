#!/usr/bin/env node
const ora = require('ora');
const inquirer = require('inquirer');
const CFonts = require('cfonts');
const chalk = require('chalk');
const _ = require('lodash');
const fuzzy = require('fuzzy');
const Promise = require('promise');
const Table = require('cli-table2');
const axios = require('axios');
const opn = require('opn');
const meow = require('meow');
const emoji = require('node-emoji');
const VERSION = meow().pkg.version;
const sourceUrl = `https://qcurrency-exchange-rates.appspot.com/api/latest`;

const cliHelp = meow(`
  Search foreign currency via interactive cli
  $ tw-forex

  Search specified currency
  $ tw-forex -s

  Show current version
  $ tw-forex -v

  Source code of this side project
  $ tw-forex -o
`);

let countryNames = [
  'USD 美元',
  'AUD 澳幣',
  'CHF 瑞士法郎',
  'ZAR 南非幣',
  'CNY 人民幣',
  'JPY 日幣',
  'GBP 英鎊',
  'NZD 紐幣',
  'SGD 新幣',
  'CAD 加幣',
  'SEK 瑞典克朗',
  'THB 泰銖',
  'HKD 港幣',
  'EUR 歐元'
]

let countryNameMap = {
  'USD': 2,
  'AUD': 3,
  'CHF': 4,
  'ZAR': 5,
  'CNY': 6,
  'JPY': 7,
  'GBP': 8,
  'NZD': 9,
  'SGD': 10,
  'CAD': 11,
  'SEK': 12,
  'THB': 13,
  'HKD': 14,
  'EUR': 15
}

let table = new Table({
  chars: {
    'top': '-',
    'top-mid': '-',
    'top-left': '-',
    'top-right': '-',
    'bottom': '-',
    'bottom-mid': '-',
    'bottom-left': '-',
    'bottom-right': '-',
    'left': '',
    'left-mid': '-',
    'mid': '-',
    'mid-mid': '-',
    'right': '',
    'right-mid': '-',
    'middle': ''
  },
  style: {
    head: [],
    border: []
  },
  colWidths: [20, 20]
});

function searchCountryName(answers, input) {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, countryNames);
      resolve(fuzzyResult.map(function(el) {
        return el.original;
      }));
    }, _.random(30, 500));
  });
}

function logoShow() {
  CFonts.say('tw-forex', {
    font: 'block', 
    align: 'left', 
    colors: ['cyan'], 
    background: 'Black', 
    letterSpacing: 1, 
    lineHeight: 1, 
    space: true,
    maxLength: '0' 
  });
}

function fetchAPI(fromSearch) {
  const spinner = ora('Take a second ....  ').start();
  let rateInfo = [];

  axios.get(sourceUrl)
    .then(function (response) {
      spinner.stop();

      table.push(
        [{
          colSpan: 2,
          hAlign: 'center', 
          content: `📅  ${response.data.update}`
        }],
        [
          chalk.yellow.bold('Country'),
          chalk.yellow.bold('Currency')
        ]
      );

      function flagAddOn (input) {
        switch (input) {
          case 'USD':
            return `${emoji.get('flag-us')}  ${input} 美元`;
          case 'AUD':
            return `${emoji.get('flag-au')}  ${input} 澳幣`;
          case 'CHF':
            return `${emoji.get('flag-ch')}  ${input} 瑞士法郎`;
          case 'ZAR':
            return `${emoji.get('flag-za')}  ${input} 南非幣`;
          case 'CNY':
            return `${emoji.get('flag-cn')}  ${input} 人民幣`;
          case 'JPY':
            return `${emoji.get('flag-jp')}  ${input} 日圓`;
          case 'GBP':
            return `${emoji.get('flag-gb')}  ${input} 英鎊`;
          case 'NZD':
            return `${emoji.get('flag-nz')}  ${input} 紐幣`;
          case 'SGD':
            return `${emoji.get('flag-sg')}  ${input} 新幣`;
          case 'CAD':
            return `${emoji.get('flag-ca')}  ${input} 加幣`;
          case 'SEK':
            return `${emoji.get('flag-se')}  ${input} 瑞典克朗`;
          case 'THB':
            return `${emoji.get('flag-th')}  ${input} 泰銖`;
          case 'HKD':
            return `${emoji.get('flag-hk')}  ${input} 港幣`;
          case 'EUR':
            return `${emoji.get('flag-eu')}  ${input} 歐元`;
          default:
            return `${emoji.get('hearts')}  ${input}`;
        }
      }

      for (let num = 0, leng = Object.keys(response.data.rates).length; num < leng; num++) {
        rateInfo.push(new Array());

        rateInfo[num].push({
          hAlign: 'left', 
          content: flagAddOn(Object.keys(response.data.rates)[num])
        });
        rateInfo[num].push({
          hAlign: 'left', 
          content: `${Object.values(response.data.rates)[num]}`
        });
      }

      for (let number = 0, leng = rateInfo.length; number < leng; number++) {
        table.push(rateInfo[number]);
      }

      if(fromSearch) {
      } else {
        console.log(table.toString());
      }
    })
    .catch(function (error) {
      spinner.stop();
    });
}

let search = function () {
  logoShow();
  fetchAPI();
}

let run = function (obj) {
  if (obj[0] === '-v') {
    console.log(`Current version is ${VERSION}`);
  } else if (obj[0] === '-h') {
    console.log(cliHelp.help);
  } else if (obj[0] === '-o') {
    opn('https://github.com/WeiChiaChang/tw-forex');
  } else if (obj[0] === '-s') {
    fetchAPI('fromSearch');
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'countryName',
        suggestOnly: true,
        message: 'Which currency you wanaa check?',
        source: searchCountryName,
        pageSize: 4,
        validate: function(val) {
          return val
            ? true
            : 'Type the country name you wanna search';
        }
      }
    ]).then(function(answers) {
      if(!_.isNaN(parseInt(Object.keys(table)[countryNameMap[answers.countryName.replace(/[^0-9a-z]/gi, '')]]))) {
        let temp = parseInt(Object.keys(table)[countryNameMap[answers.countryName.replace(/[^0-9a-z]/gi, '')]]);
        let tempLeng = '';
        for(let i = 0; i < 30; i++) {
          tempLeng += '-';
        }
        console.log(tempLeng);
        console.log(`${table[temp][0].content.toString()} ${table[temp][1].content.toString()}`);
        console.log(tempLeng);
      }
    });
  } else if (typeof obj[0] === 'string') {
    search(obj[0]);
  } else {
    search();
  };
};

run(process.argv.slice(2));
