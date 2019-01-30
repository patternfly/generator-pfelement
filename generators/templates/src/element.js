import PFElement from "../pfelement/pfelement.js";

class <%= elementClassName %> extends PFElement {
  static get tag() {
    return "<%= elementName %>";
  }

  get schemaUrl() {
    return "<%= elementName %>.json";
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
    return [<%_ attributes.join(", ") _%>];
  }
<%_ } else { _%>
  // static get observedAttributes() {
  //   return [];
  // }
<%_ } _%>

  // Declare the type of this component
  static get PfeType() {
    return PFElement.PfeTypes.<%= _.capitalize(template_type) %>;
  }

  constructor() {
    super(<%= elementClassName %>, { type: PfeBand.PfeType });
  }

  // connectedCallback() {
  //   super.connectedCallback();
  //   // If you need to initialize any attributes, do that here
  // }

  // disconnectedCallback() {}

<%_ if (attributes.length > 0) { _%>
  // Process the attribute change
  attributeChangedCallback(attr, oldValue, newValue) {
    super.attributeChangedCallback(attr, oldValue, newValue);
    // Strip the prefix from the attribute
    attr = attr.replace("pfe-", "");
    // If the observer is defined in the attribute properties
    if (this[attr] && this[attr].observer) {
      // Get the observer function
      let observer = this[this[attr].observer].bind(this);
      // If it's a function, allow it to run
      if (typeof observer === "function") observer(attr, oldValue, newValue);
    }
  }
<%_ } else { _%>
  // attributeChangedCallback(attr, oldValue, newValue) {}
<%_ } _%>
}

PFElement.create(<%= elementClassName %>);

export { <%= elementClassName %> as default };
