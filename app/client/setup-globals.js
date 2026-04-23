import katex from 'katex'
import 'katex/dist/katex.min.css'
import 'katex/contrib/mhchem'

import mermaid from 'mermaid'

import _ from 'underscore'

import flowchart from 'flowchart.js'

import WebFont from 'webfontloader'

import '../_static/page.css'
import '../_static/markdown.css'
import '../_static/highlight.css'
import '../_static/sequence-diagram-min.css'

window.katex = katex
window.mermaid = mermaid
window._ = _
window.WebFont = WebFont
window.flowchart = flowchart
