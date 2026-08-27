(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // wp-global:@wordpress/blocks
  var require_blocks = __commonJS({
    "wp-global:@wordpress/blocks"(exports, module) {
      module.exports = window.wp.blocks;
    }
  });

  // wp-global:@wordpress/block-editor
  var require_block_editor = __commonJS({
    "wp-global:@wordpress/block-editor"(exports, module) {
      module.exports = window.wp.blockEditor;
    }
  });

  // wp-global:@wordpress/data
  var require_data = __commonJS({
    "wp-global:@wordpress/data"(exports, module) {
      module.exports = window.wp.data;
    }
  });

  // wp-global:@wordpress/element
  var require_element = __commonJS({
    "wp-global:@wordpress/element"(exports, module) {
      module.exports = window.wp.element;
    }
  });

  // wp-global:@wordpress/i18n
  var require_i18n = __commonJS({
    "wp-global:@wordpress/i18n"(exports, module) {
      module.exports = window.wp.i18n;
    }
  });

  // wp-global:@wordpress/components
  var require_components = __commonJS({
    "wp-global:@wordpress/components"(exports, module) {
      module.exports = window.wp.components;
    }
  });

  // wp-global:@wordpress/icons
  var require_icons = __commonJS({
    "wp-global:@wordpress/icons"(exports, module) {
      module.exports = window.wp.icons;
    }
  });

  // wp-global:@wordpress/api-fetch
  var require_api_fetch = __commonJS({
    "wp-global:@wordpress/api-fetch"(exports, module) {
      module.exports = window.wp.apiFetch;
    }
  });

  // blocks/smart-gallery/index.js
  var import_blocks = __toESM(require_blocks());

  // blocks/smart-gallery/block.json
  var block_default = {
    $schema: "https://schemas.wp.org/trunk/block.json",
    apiVersion: 3,
    name: "matcha-ai/smart-gallery",
    version: "1.0.0",
    title: "Matcha AI Smart Gallery",
    category: "media",
    icon: "format-gallery",
    description: "AI-powered filterable image gallery with grid and masonry layouts.",
    keywords: ["gallery", "images", "filter", "ai", "matcha", "masonry"],
    textdomain: "matcha-gallery",
    supports: {
      html: false,
      align: ["wide", "full"],
      spacing: {
        margin: true,
        padding: true
      }
    },
    attributes: {
      sourceType: {
        type: "string",
        default: "selected"
      },
      imageIds: {
        type: "array",
        default: [],
        items: {
          type: "number"
        }
      },
      aiTags: {
        type: "array",
        default: [],
        items: {
          type: "string"
        }
      },
      layout: {
        type: "string",
        default: "grid",
        enum: ["grid", "masonry"]
      },
      columns: {
        type: "number",
        default: 3
      },
      columnsTablet: {
        type: "number",
        default: 2
      },
      columnsMobile: {
        type: "number",
        default: 1
      },
      gutterSize: {
        type: "number",
        default: 16
      },
      filtersEnabled: {
        type: "boolean",
        default: true
      },
      showAllFilter: {
        type: "boolean",
        default: true
      },
      showTitle: {
        type: "boolean",
        default: true
      },
      showCaption: {
        type: "boolean",
        default: false
      },
      lightboxEnabled: {
        type: "boolean",
        default: true
      },
      galleryId: {
        type: "number",
        default: 0
      }
    },
    editorScript: "file:../../build/smart-gallery/index.js",
    editorStyle: "file:../../build/smart-gallery/index.css"
  };

  // blocks/smart-gallery/edit.js
  var import_block_editor4 = __toESM(require_block_editor());
  var import_data = __toESM(require_data());
  var import_element3 = __toESM(require_element());

  // blocks/smart-gallery/components/GalleryPlaceholder.js
  var import_i18n = __toESM(require_i18n());
  var import_components = __toESM(require_components());
  var import_block_editor = __toESM(require_block_editor());
  var import_icons = __toESM(require_icons());
  var import_element = __toESM(require_element());
  var import_api_fetch = __toESM(require_api_fetch());
  function GalleryPlaceholder({ attributes, setAttributes }) {
    const { sourceType, galleryId } = attributes;
    const [studioGalleries, setStudioGalleries] = (0, import_element.useState)([]);
    (0, import_element.useEffect)(() => {
      (0, import_api_fetch.default)({ path: "/matcha-gallery/v1/galleries" }).then((data) => {
        if (Array.isArray(data)) {
          setStudioGalleries(data);
        }
      }).catch(() => setStudioGalleries([]));
    }, []);
    const onSelectImages = (media) => {
      const ids = media.map((img) => img.id);
      setAttributes({
        sourceType: "selected",
        imageIds: ids,
        galleryId: 0
      });
    };
    const galleryOptions = [
      { label: (0, import_i18n.__)("-- Or Choose a Studio Gallery --", "matcha-gallery"), value: 0 },
      ...studioGalleries.map((g) => ({
        label: `#${g.id} \u2014 ${g.title || "Untitled Gallery"} (${(g.config?.imageIds || []).length} photos)`,
        value: g.id
      }))
    ];
    return /* @__PURE__ */ window.wp.element.createElement(
      import_components.Placeholder,
      {
        icon: import_icons.gallery,
        label: (0, import_i18n.__)("Matcha AI Smart Gallery", "matcha-gallery"),
        instructions: (0, import_i18n.__)(
          "Link to a master gallery designed in Matcha Studio, select photos from your Media Library, or use dynamic AI tag-based sourcing.",
          "matcha-gallery"
        ),
        className: "matcha-gallery-placeholder"
      },
      /* @__PURE__ */ window.wp.element.createElement("div", { className: "matcha-gallery-placeholder__actions", style: { display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "420px" } }, studioGalleries.length > 0 && /* @__PURE__ */ window.wp.element.createElement("div", { style: { width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px" } }, /* @__PURE__ */ window.wp.element.createElement(
        import_components.SelectControl,
        {
          label: (0, import_i18n.__)("\u{1F375} Select Studio Gallery", "matcha-gallery"),
          value: galleryId || 0,
          options: galleryOptions,
          onChange: (val) => {
            const numId = parseInt(val);
            if (numId > 0) {
              setAttributes({ galleryId: numId });
            }
          }
        }
      )), /* @__PURE__ */ window.wp.element.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" } }, /* @__PURE__ */ window.wp.element.createElement(import_block_editor.MediaUploadCheck, null, /* @__PURE__ */ window.wp.element.createElement(
        import_block_editor.MediaUpload,
        {
          onSelect: onSelectImages,
          allowedTypes: ["image"],
          multiple: true,
          gallery: true,
          render: ({ open }) => /* @__PURE__ */ window.wp.element.createElement(
            import_components.Button,
            {
              variant: "primary",
              onClick: open,
              className: "matcha-gallery-placeholder__btn"
            },
            (0, import_i18n.__)("\u{1F5BC} Select Images", "matcha-gallery")
          )
        }
      )), /* @__PURE__ */ window.wp.element.createElement(
        "a",
        {
          href: "admin.php?page=matcha-studio",
          target: "_blank",
          rel: "noreferrer",
          className: "components-button is-secondary",
          style: { textDecoration: "none" }
        },
        (0, import_i18n.__)("\u{1F3A8} Open Matcha Studio \u2197", "matcha-gallery")
      )), /* @__PURE__ */ window.wp.element.createElement("div", { className: "matcha-gallery-placeholder__divider" }, /* @__PURE__ */ window.wp.element.createElement("span", null, (0, import_i18n.__)("or dynamic mode", "matcha-gallery"))), /* @__PURE__ */ window.wp.element.createElement(
        import_components.ToggleControl,
        {
          label: (0, import_i18n.__)("Use dynamic source (AI tags)", "matcha-gallery"),
          help: (0, import_i18n.__)(
            "Automatically populate the gallery with images matching specific AI keywords.",
            "matcha-gallery"
          ),
          checked: sourceType === "dynamic",
          onChange: (isDynamic) => setAttributes({
            sourceType: isDynamic ? "dynamic" : "selected",
            galleryId: 0
          })
        }
      ))
    );
  }

  // blocks/smart-gallery/components/GalleryPreview.js
  var import_i18n2 = __toESM(require_i18n());
  var import_components2 = __toESM(require_components());
  var import_block_editor2 = __toESM(require_block_editor());
  function GalleryPreview({ images, attributes, setAttributes }) {
    const {
      sourceType,
      imageIds,
      layout,
      columns,
      gutterSize,
      showTitle,
      showCaption
    } = attributes;
    if (!images || images.length === 0) {
      return /* @__PURE__ */ window.wp.element.createElement("div", { className: "matcha-gallery-preview matcha-gallery-preview--loading" }, /* @__PURE__ */ window.wp.element.createElement(import_components2.Spinner, null), /* @__PURE__ */ window.wp.element.createElement("p", null, (0, import_i18n2.__)("Loading gallery preview\u2026", "matcha-gallery")));
    }
    const gridStyle = {
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gutterSize}px`
    };
    const masonryStyle = {
      columnCount: columns,
      columnGap: `${gutterSize}px`
    };
    const onSelectImages = (media) => {
      setAttributes({
        imageIds: media.map((img) => img.id)
      });
    };
    const getPreviewUrl = (image) => {
      if (image.media_details?.sizes?.medium_large?.source_url) {
        return image.media_details.sizes.medium_large.source_url;
      }
      if (image.media_details?.sizes?.medium?.source_url) {
        return image.media_details.sizes.medium.source_url;
      }
      return image.source_url || "";
    };
    const getAlt = (image) => {
      return image.alt_text || image.title?.rendered || "";
    };
    return /* @__PURE__ */ window.wp.element.createElement("div", { className: "matcha-gallery-preview" }, /* @__PURE__ */ window.wp.element.createElement("div", { className: "matcha-gallery-preview__toolbar" }, /* @__PURE__ */ window.wp.element.createElement("span", { className: "matcha-gallery-preview__count" }, images.length, " ", images.length === 1 ? (0, import_i18n2.__)("image", "matcha-gallery") : (0, import_i18n2.__)("images", "matcha-gallery")), sourceType === "selected" && /* @__PURE__ */ window.wp.element.createElement(import_block_editor2.MediaUploadCheck, null, /* @__PURE__ */ window.wp.element.createElement(
      import_block_editor2.MediaUpload,
      {
        onSelect: onSelectImages,
        allowedTypes: ["image"],
        multiple: true,
        gallery: true,
        value: imageIds,
        render: ({ open }) => /* @__PURE__ */ window.wp.element.createElement(
          import_components2.Button,
          {
            variant: "secondary",
            onClick: open,
            size: "small"
          },
          (0, import_i18n2.__)("Edit Selection", "matcha-gallery")
        )
      }
    ))), /* @__PURE__ */ window.wp.element.createElement(
      "div",
      {
        className: `matcha-gallery-preview__grid matcha-gallery-preview__grid--${layout}`,
        style: layout === "masonry" ? masonryStyle : gridStyle
      },
      images.map((image) => /* @__PURE__ */ window.wp.element.createElement(
        "div",
        {
          key: image.id,
          className: "matcha-gallery-preview__item",
          style: layout === "masonry" ? { breakInside: "avoid", marginBottom: `${gutterSize}px` } : {}
        },
        /* @__PURE__ */ window.wp.element.createElement(
          "img",
          {
            src: getPreviewUrl(image),
            alt: getAlt(image),
            className: "matcha-gallery-preview__img"
          }
        ),
        (showTitle || showCaption) && /* @__PURE__ */ window.wp.element.createElement("div", { className: "matcha-gallery-preview__info" }, showTitle && image.title?.rendered && /* @__PURE__ */ window.wp.element.createElement("span", { className: "matcha-gallery-preview__title" }, image.title.rendered), showCaption && image.caption?.rendered && /* @__PURE__ */ window.wp.element.createElement(
          "span",
          {
            className: "matcha-gallery-preview__caption",
            dangerouslySetInnerHTML: {
              __html: image.caption.rendered
            }
          }
        ))
      ))
    ));
  }

  // blocks/smart-gallery/components/InspectorControls.js
  var import_i18n3 = __toESM(require_i18n());
  var import_block_editor3 = __toESM(require_block_editor());
  var import_components3 = __toESM(require_components());
  var import_element2 = __toESM(require_element());
  var import_api_fetch2 = __toESM(require_api_fetch());
  function GalleryInspectorControls({ attributes, setAttributes }) {
    const {
      sourceType,
      aiTags,
      layout,
      columns,
      columnsTablet,
      columnsMobile,
      gutterSize,
      filtersEnabled,
      showAllFilter,
      showTitle,
      showCaption,
      lightboxEnabled,
      galleryId
    } = attributes;
    const [availableKeywords, setAvailableKeywords] = (0, import_element2.useState)([]);
    const [keywordsLoading, setKeywordsLoading] = (0, import_element2.useState)(false);
    const [studioGalleries, setStudioGalleries] = (0, import_element2.useState)([]);
    (0, import_element2.useEffect)(() => {
      setKeywordsLoading(true);
      (0, import_api_fetch2.default)({ path: "/matcha-gallery/v1/ai-keywords" }).then((data) => {
        setAvailableKeywords(
          data.map((term) => term.name)
        );
      }).catch(() => {
        setAvailableKeywords([]);
      }).finally(() => {
        setKeywordsLoading(false);
      });
      (0, import_api_fetch2.default)({ path: "/matcha-gallery/v1/galleries" }).then((data) => {
        if (Array.isArray(data)) {
          setStudioGalleries(data);
        }
      }).catch(() => {
        setStudioGalleries([]);
      });
    }, []);
    const galleryOptions = [
      { label: (0, import_i18n3.__)("None (Custom Block Settings)", "matcha-gallery"), value: 0 },
      ...studioGalleries.map((g) => ({
        label: `#${g.id} \u2014 ${g.title || "Untitled Gallery"} (${(g.config?.imageIds || []).length} photos)`,
        value: g.id
      }))
    ];
    const selectedGallery = studioGalleries.find((g) => g.id === galleryId);
    return /* @__PURE__ */ window.wp.element.createElement(import_block_editor3.InspectorControls, null, /* @__PURE__ */ window.wp.element.createElement(
      import_components3.PanelBody,
      {
        title: (0, import_i18n3.__)("\u{1F375} Matcha Studio Gallery", "matcha-gallery"),
        initialOpen: true
      },
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.SelectControl,
        {
          label: (0, import_i18n3.__)("Select Gallery", "matcha-gallery"),
          value: galleryId || 0,
          options: galleryOptions,
          help: (0, import_i18n3.__)("Link this block to a master gallery designed in Matcha Studio.", "matcha-gallery"),
          onChange: (val) => {
            const numId = parseInt(val);
            setAttributes({ galleryId: numId });
          }
        }
      ),
      galleryId > 0 ? /* @__PURE__ */ window.wp.element.createElement("div", { style: { marginTop: "12px", padding: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px" } }, /* @__PURE__ */ window.wp.element.createElement("div", { style: { fontWeight: 700, color: "#166534", fontSize: "12px", marginBottom: "4px" } }, "\u2713 Connected to #", galleryId, " (", selectedGallery?.title || "Gallery", ")"), /* @__PURE__ */ window.wp.element.createElement("p", { style: { fontSize: "11px", color: "#15803d", margin: "0 0 8px 0" } }, "Layouts, frames, tags, search bar, and accent colors are managed in Studio."), /* @__PURE__ */ window.wp.element.createElement(
        "a",
        {
          href: `admin.php?page=matcha-studio&post=${galleryId}`,
          target: "_blank",
          rel: "noreferrer",
          style: {
            display: "inline-block",
            padding: "5px 10px",
            background: "#16a34a",
            color: "#fff",
            borderRadius: "4px",
            textDecoration: "none",
            fontSize: "11px",
            fontWeight: 700
          }
        },
        "Open in Matcha Studio \u2197"
      )) : /* @__PURE__ */ window.wp.element.createElement("div", { style: { marginTop: "8px" } }, /* @__PURE__ */ window.wp.element.createElement(
        "a",
        {
          href: "admin.php?page=matcha-studio",
          target: "_blank",
          rel: "noreferrer",
          style: { fontSize: "11px", color: "#16a34a", fontWeight: 600 }
        },
        "+ Create New Gallery in Studio \u2197"
      ))
    ), (!galleryId || galleryId === 0) && /* @__PURE__ */ window.wp.element.createElement(
      import_components3.PanelBody,
      {
        title: (0, import_i18n3.__)("Content Source", "matcha-gallery"),
        initialOpen: false
      },
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.RadioControl,
        {
          label: (0, import_i18n3.__)("Source", "matcha-gallery"),
          selected: sourceType,
          options: [
            {
              label: (0, import_i18n3.__)("Selected images", "matcha-gallery"),
              value: "selected"
            },
            {
              label: (0, import_i18n3.__)("Dynamic (by AI tags)", "matcha-gallery"),
              value: "dynamic"
            }
          ],
          onChange: (value) => setAttributes({ sourceType: value })
        }
      ),
      sourceType === "dynamic" && /* @__PURE__ */ window.wp.element.createElement(
        import_components3.FormTokenField,
        {
          label: (0, import_i18n3.__)("AI Keywords", "matcha-gallery"),
          value: aiTags,
          suggestions: availableKeywords,
          onChange: (tokens) => setAttributes({ aiTags: tokens }),
          placeholder: keywordsLoading ? (0, import_i18n3.__)("Loading\u2026", "matcha-gallery") : (0, import_i18n3.__)("Type to search AI keywords", "matcha-gallery"),
          __experimentalExpandOnFocus: true
        }
      )
    ), /* @__PURE__ */ window.wp.element.createElement(
      import_components3.PanelBody,
      {
        title: (0, import_i18n3.__)("Layout", "matcha-gallery"),
        initialOpen: false
      },
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.SelectControl,
        {
          label: (0, import_i18n3.__)("Layout Type", "matcha-gallery"),
          value: layout,
          options: [
            { label: (0, import_i18n3.__)("Grid", "matcha-gallery"), value: "grid" },
            { label: (0, import_i18n3.__)("Masonry", "matcha-gallery"), value: "masonry" }
          ],
          onChange: (value) => setAttributes({ layout: value })
        }
      ),
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.RangeControl,
        {
          label: (0, import_i18n3.__)("Columns (Desktop)", "matcha-gallery"),
          value: columns,
          onChange: (value) => setAttributes({ columns: value }),
          min: 1,
          max: 6
        }
      ),
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.RangeControl,
        {
          label: (0, import_i18n3.__)("Columns (Tablet)", "matcha-gallery"),
          value: columnsTablet,
          onChange: (value) => setAttributes({ columnsTablet: value }),
          min: 1,
          max: 4
        }
      ),
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.RangeControl,
        {
          label: (0, import_i18n3.__)("Columns (Mobile)", "matcha-gallery"),
          value: columnsMobile,
          onChange: (value) => setAttributes({ columnsMobile: value }),
          min: 1,
          max: 3
        }
      ),
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.RangeControl,
        {
          label: (0, import_i18n3.__)("Gutter Size (px)", "matcha-gallery"),
          value: gutterSize,
          onChange: (value) => setAttributes({ gutterSize: value }),
          min: 0,
          max: 48,
          step: 4
        }
      )
    ), /* @__PURE__ */ window.wp.element.createElement(
      import_components3.PanelBody,
      {
        title: (0, import_i18n3.__)("Filters", "matcha-gallery"),
        initialOpen: false
      },
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.ToggleControl,
        {
          label: (0, import_i18n3.__)("Enable filters", "matcha-gallery"),
          help: (0, import_i18n3.__)(
            "Show filter buttons above the gallery based on AI keywords.",
            "matcha-gallery"
          ),
          checked: filtersEnabled,
          onChange: (value) => setAttributes({ filtersEnabled: value })
        }
      ),
      filtersEnabled && /* @__PURE__ */ window.wp.element.createElement(
        import_components3.ToggleControl,
        {
          label: (0, import_i18n3.__)('Show "All" filter', "matcha-gallery"),
          checked: showAllFilter,
          onChange: (value) => setAttributes({ showAllFilter: value })
        }
      )
    ), /* @__PURE__ */ window.wp.element.createElement(
      import_components3.PanelBody,
      {
        title: (0, import_i18n3.__)("Display", "matcha-gallery"),
        initialOpen: false
      },
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.ToggleControl,
        {
          label: (0, import_i18n3.__)("Show title", "matcha-gallery"),
          checked: showTitle,
          onChange: (value) => setAttributes({ showTitle: value })
        }
      ),
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.ToggleControl,
        {
          label: (0, import_i18n3.__)("Show caption", "matcha-gallery"),
          checked: showCaption,
          onChange: (value) => setAttributes({ showCaption: value })
        }
      ),
      /* @__PURE__ */ window.wp.element.createElement(
        import_components3.ToggleControl,
        {
          label: (0, import_i18n3.__)("Enable lightbox", "matcha-gallery"),
          help: (0, import_i18n3.__)(
            "Allow clicking images to view them in a larger overlay.",
            "matcha-gallery"
          ),
          checked: lightboxEnabled,
          onChange: (value) => setAttributes({ lightboxEnabled: value })
        }
      )
    ));
  }

  // blocks/smart-gallery/edit.js
  var import_api_fetch3 = __toESM(require_api_fetch());
  function Edit({ attributes, setAttributes }) {
    const {
      sourceType,
      imageIds,
      aiTags,
      layout,
      columns,
      gutterSize,
      showTitle,
      showCaption,
      galleryId
    } = attributes;
    const studioUrl = galleryId ? `admin.php?page=matcha-studio&post=${galleryId}` : "admin.php?page=matcha-studio";
    const [studioConfig, setStudioConfig] = (0, import_element3.useState)(null);
    (0, import_element3.useEffect)(() => {
      if (galleryId > 0) {
        (0, import_api_fetch3.default)({ path: `/matcha-gallery/v1/galleries/${galleryId}` }).then((data) => {
          if (data?.config) {
            setStudioConfig(data.config);
          }
        }).catch(() => setStudioConfig(null));
      } else {
        setStudioConfig(null);
      }
    }, [galleryId]);
    const effectiveImageIds = galleryId > 0 && studioConfig?.imageIds ? studioConfig.imageIds : imageIds;
    const effectiveLayout = galleryId > 0 && studioConfig?.layout ? studioConfig.layout : layout;
    const blockProps = (0, import_block_editor4.useBlockProps)({
      className: `matcha-gallery-editor matcha-gallery-editor--${effectiveLayout}`
    });
    const images = (0, import_data.useSelect)(
      (select) => {
        if (sourceType !== "selected" && !galleryId || !effectiveImageIds?.length) {
          return [];
        }
        const media = select("core").getEntityRecords("postType", "attachment", {
          include: effectiveImageIds,
          per_page: Math.min(100, effectiveImageIds.length),
          orderby: "include"
        });
        return media || [];
      },
      [sourceType, effectiveImageIds, galleryId]
    );
    const dynamicImages = (0, import_data.useSelect)(
      (select) => {
        if (sourceType !== "dynamic" || !aiTags.length || galleryId > 0) {
          return [];
        }
        const media = select("core").getEntityRecords("postType", "attachment", {
          matcha_ai_keywords: aiTags.join(","),
          per_page: 50,
          status: "inherit"
        });
        return media || [];
      },
      [sourceType, aiTags, galleryId]
    );
    const displayImages = galleryId > 0 || sourceType === "selected" ? images : dynamicImages;
    const hasImages = effectiveImageIds && effectiveImageIds.length > 0 || sourceType === "dynamic" && aiTags.length > 0;
    const convertToGallery = async () => {
      try {
        const res = await (0, import_api_fetch3.default)({ path: "/matcha-gallery/v1/galleries", method: "POST", data: { title: "Converted Gallery", config: { sourceType, imageIds, aiTags, layout, columns, gutterSize } } });
        if (res?.id) {
          setAttributes({ galleryId: res.id });
        }
      } catch (e) {
        console.error(e);
      }
    };
    return /* @__PURE__ */ window.wp.element.createElement("div", { ...blockProps }, /* @__PURE__ */ window.wp.element.createElement(
      GalleryInspectorControls,
      {
        attributes,
        setAttributes
      }
    ), galleryId > 0 ? /* @__PURE__ */ window.wp.element.createElement("div", { style: { padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "12px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ window.wp.element.createElement("div", null, /* @__PURE__ */ window.wp.element.createElement("strong", { style: { color: "#166534" } }, "\u{1F375} Matcha Studio Gallery #", galleryId), /* @__PURE__ */ window.wp.element.createElement("span", { style: { marginLeft: "8px", color: "#15803d", fontSize: "11px" } }, "(", effectiveImageIds.length, " photos)")), /* @__PURE__ */ window.wp.element.createElement("a", { href: studioUrl, target: "_blank", rel: "noreferrer", style: { padding: "4px 10px", background: "#16a34a", color: "#fff", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "11px" } }, "Edit in Studio \u2197")) : imageIds.length > 0 && /* @__PURE__ */ window.wp.element.createElement("div", { style: { padding: "8px 10px", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "6px", marginBottom: "8px", fontSize: "12px" } }, "Legacy inline block \u2014 ", /* @__PURE__ */ window.wp.element.createElement("button", { type: "button", className: "button button-small", onClick: convertToGallery }, "Convert to Matcha Studio Gallery")), !hasImages ? /* @__PURE__ */ window.wp.element.createElement(
      GalleryPlaceholder,
      {
        attributes,
        setAttributes
      }
    ) : /* @__PURE__ */ window.wp.element.createElement(
      GalleryPreview,
      {
        images: displayImages,
        attributes,
        setAttributes
      }
    ));
  }

  // blocks/smart-gallery/save.js
  function save() {
    return null;
  }

  // blocks/smart-gallery/index.js
  var matchaIcon = /* @__PURE__ */ window.wp.element.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ window.wp.element.createElement(
    "path",
    {
      fill: "#4CAF50",
      d: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
    }
  ));
  (0, import_blocks.registerBlockType)(block_default.name, {
    icon: matchaIcon,
    edit: Edit,
    save
  });
})();
