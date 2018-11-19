/*
 * Copyright 2018 Red Hat, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import RHElement from "../rhelement/rhelement.js";

class <%= elementClassName %> extends RHElement {
  static get tag() {
    return "<%= elementName %>";
  }

  get templateUrl() {
    return "<%= elementName %>.html";
  }

  get styleUrl() {
<%_ if (useSass) { _%>
    return "<%= elementName %>.scss";
<%_ } else { _%>
    return "<%= elementName %>.css";
<%_ } _%>
  }

<%_ if (attributes.length > 0) { _%>
  static get observedAttributes() {
    return [<%_ _.join(attributes, ", ") _%>];
  }
<%_ } else { _%>
  // static get observedAttributes() {
  //   return [];
  // }
<%_ } _%>

  constructor() {
    super(<%= elementClassName %>);
  }

  // connectedCallback() {
  //   super.connectedCallback();
  // }

  // disconnectedCallback() {}

<%_ if (attributes.length > 0) { _%>
  // Process the attribute change
  attributeChangedCallback(attr, oldValue, newValue) {}
<%_ } else { _%>
  // attributeChangedCallback(attr, oldValue, newValue) {}
<%_ } _%>
}

RHElement.create(<%= elementClassName %>, { type: <%_ template_type _%>});

export default <%= elementClassName %>;
