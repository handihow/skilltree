export const standardTheme  = {
    backgroundColor: 'transparent',
    border: '2px solid white',
    borderRadius: '4px',
    primaryFont: 'Nunito',
    primaryFontColor: 'white',
    treeBackgroundColor: 'rgba(0, 0, 0, .6)',
    headingFont: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    headingFontColor: 'white',
    headingFontSize: '24px',
    headingHoverColor: 'rgba(0, 0, 0, .6)',
    headingHoverColorTransition: 'background 0.3s ease-out',
    tooltipBackgroundColor: 'white',
    tooltipFontColor: '#16181c',
    tooltipZIndex: 99999,
    nodeBackgroundColor: '#282c34',
    nodeBorderColor: 'white',
    nodeAlternativeFontColor: 'white',
    nodeAltenativeActiveFontColor: 'white',
    nodeOverlayColor: 'white',
    nodeAlternativeActiveBackgroundColor: `
    linear-gradient(
      to right,
      #b9e562 0%,
      #41e2bd 50%,
      #c284d8 100%
    )`,
    nodeActiveBackgroundColor: `linear-gradient(
        to right,
        #b9e562 0%,
        #41e2bd 50%,
        #c284d8 100%
      )`,
    nodeHoverBorder: '4px solid',
    nodeHoverBorderColor: `linear-gradient(
        to right,
        #b9e562 0%,
        #41e2bd 50%,
        #c284d8 100%
      )`,
    nodeIconWidth: '64px',
    nodeMobileTextNodeHeight: '32px',
    nodeMobileTextNodeWidth: '108px',
    nodeMobileFontSize: '14px',
    nodeDesktopTextNodeHeight: '28px',
    nodeDesktopTextNodeWidth: '144px',
    nodeDesktopFontSize: '16px',
    edgeBorder: '1px solid white',
  }

export const standardData = [
    {
      id: 'hello-world',
      title: 'Hello World',
      tooltip: {
        description:
          'This node is the top most level, and will be unlocked, and ready to be clicked.',
        links: []
      },
      children: [
        {
          id: 'hello-sun',
          title: 'Hello Sun',
          tooltip: {
            description:
              'This is a child of the top node, and will be locked while the parent isn’t in a selected state.',
            links: [{
                id: '1',
                reference: 'https://youtube.com', 
                title: 'Link to YouYube', 
                icon: 'youtube-square',
                iconLibrary: 'fab'
            }]
          },
          children: [],
        },
        {
          id: 'hello-stars',
          title: 'Hello Stars',
          tooltip: {
            description:
              'This is the child of ‘Hello World and the sibling of ‘Hello Sun’. Notice how the app takes care of the layout automatically?',
            links: []
          },
          children: [],
        },
      ],
    },
  ];

  export const standardRootSkill = {
    title: 'Hello World',
    description: 'This node is the top most level, and will be unlocked, and ready to be clicked.',
    order: 0,
    links: [],
    childCount: 2
  } 
  
  export const standardChildSkills = [
    {
      title: 'Hello Sun',
      description:
          'This is a child of the top node, and will be locked while the parent isn’t in a selected state.',
      links: [{
            id: 0,
            reference: 'https://youtube.com', 
            title: 'Link to YouYube', 
            icon: 'youtube'
        }],
      order: 0,
      childCount: 0
    },
    {
      title: 'Hello Stars',
      description:
          'This is the child of ‘Hello World and the sibling of ‘Hello Sun’. Notice how the app takes care of the layout automatically?',
      links: [],
      order: 1,
      childCount: 0
    }
  ];

  export const linkIcons = {
    'youtube': 
      {
        icon: 'youtube-square',
        iconLibrary: 'fab'
      },
    'link': {
        icon: 'link',
        iconLibrary: 'fas'
    },
    'file': {
        icon: 'file',
        iconLibrary: 'fas'
    }
  }

  export const standardSkilltree = {
    collapsible: true,
    data: standardData,
    description: "More information about my skill tree",
    id: '1',
    title: 'Example',
    order: 0
  }

  const cssColors = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
  ]
const colors = []; 
cssColors.forEach(color => {
    colors.push({value: color.toLocaleLowerCase(), title: color})
});

export const allColors = colors;

export const gradients = [{value: "linear-gradient(to right, #59c173, #a17fe0, #5d26c1)", title:"Magic"},
        {value: "linear-gradient(to right, #b9e562 0%, #41e2bd 50%, #c284d8 100%)", title: "Rainbow"},
        {value: "linear-gradient(to right, #a8c0ff, #3f2b96)", title: "Ocean View"},
        {value: "linear-gradient(to right, #333333, #dd1818)", title: "Pure Lust"},
        {value: "linear-gradient(to right, #4e54c8, #8f94fb)", title: "Moon Purple"},
        {value: "linear-gradient(to right, #355c7d, #6c5b7b, #c06c84)", title:"Red Sunset"},
        {value: "linear-gradient(to right, #40e0d0, #ff8c00, #ff0080)", title: "Wedding Day Blues"},
        {value: "linear-gradient(to right, #3e5151, #decba4)", title: "Sand to Blue"},
        {value: "linear-gradient(to right, #283048, #859398)", title: "Titanium"},
        {value: "linear-gradient(to right, #232526, #414345)", title: "Midnight City"},
        {value: "linear-gradient(to right, #ff512f, #dd2476)", title: "Bloody Mary"}];