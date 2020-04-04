# AUTO GENERATED FILE - DO NOT EDIT

''DashFloorPlan <- function(id=NULL, selection=NULL, height=NULL, width=NULL, shapes=NULL, data=NULL, image=NULL) {
    
    props <- list(id=id, selection=selection, height=height, width=width, shapes=shapes, data=data, image=image)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'DashFloorPlan',
        namespace = 'dash_floorplan',
        propNames = c('id', 'selection', 'height', 'width', 'shapes', 'data', 'image'),
        package = 'dashFloorplan'
        )

    structure(component, class = c('dash_component', 'list'))
}
