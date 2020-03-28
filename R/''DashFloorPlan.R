# AUTO GENERATED FILE - DO NOT EDIT

''DashFloorPlan <- function(id=NULL, height=NULL, width=NULL, data=NULL, image=NULL) {
    
    props <- list(id=id, height=height, width=width, data=data, image=image)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'DashFloorPlan',
        namespace = 'dash_floorplan',
        propNames = c('id', 'height', 'width', 'data', 'image'),
        package = 'dashFloorplan'
        )

    structure(component, class = c('dash_component', 'list'))
}
