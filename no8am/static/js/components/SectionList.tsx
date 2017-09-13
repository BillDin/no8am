import * as React from 'react'

import {connect} from 'react-redux'

import {SEARCH_ITEM_TYPE} from '../Constants'

import Filters from './Filters'
import SectionListCard from './SectionListCard'


@connect(mapStateToProps, mapDispatchToProps)
export default class SectionList extends React.Component {

    render() {
        let cacheTime = this.props.data.cache_time || new Date();
        let searchItem = this.props.item;
        let sections = this.props.data;
        let isFromCategorySearch = this.props.item.itemType != SEARCH_ITEM_TYPE.Course &&
                               this.props.item.itemType != SEARCH_ITEM_TYPE.Department;

        let visibleCount = 0;

        let sectionCards = sections.map(section => {

            let isVisible = this.isVisible(section);

            visibleCount = isVisible ? visibleCount + 1 : visibleCount;

            let lastSectionOfType = sections.filter(maybeSectionOfType => isVisible && this.isVisible(maybeSectionOfType) &&
                maybeSectionOfType.departmentAndCourse == section.departmentAndCourse).pop();

            let isLastOfType = lastSectionOfType != undefined && lastSectionOfType.CRN == section.CRN;

            return (<SectionListCard
                        key={section.CRN}
                        {...section}
                        isLastOfType={isLastOfType}
                        isSelected={this.props.selectedSections.find(selectedSection => selectedSection.CRN == section.CRN)}
                        isUnavailable={this.isUnavailable(section)}
                        isVisible={isVisible}
                        shouldAskShowSingleCourse={section.departmentAndCourse == this.props.askShowSingleCourse && isLastOfType}
                        isFromCategorySearch={isFromCategorySearch} />
                   );
        });

        return (
            <div className="sectionList">
                <Filters 
                    showSingleCourse={this.props.showSingleCourse}
                    singleCourseOrigin={this.props.singleCourseOrigin}
                    filterTime={this.props.filterTime} 
                    item={this.props.item} 
                    numberOfSectionsVisible={visibleCount}
                    numberOfSectionsTotal={sections.length}
                    />
                {sectionCards}
            </div>
        );
    }

    isUnavailable(section) {
        return this.props.selectedSections.find(selectedSection =>
            section.departmentAndBareCourse == selectedSection.departmentAndBareCourse &&
            ((section.main && !selectedSection.main && !selectedSection.dependent_main_sections.includes(section.sectionNum)) ||
            (!section.main && selectedSection.main && !section.dependent_main_sections.includes(selectedSection.sectionNum)))
        );
    }

    isVisible(section) {
        return (this.props.isAdvanced || !this.isUnavailable(section)) &&
               (this.props.showSingleCourse == null || this.props.showSingleCourse == section.departmentAndBareCourse) &&
               (section.daysMet.every(meetingTime => meetingTime[1] >= this.props.filterTime[0] &&
                                    meetingTime[2] + meetingTime[1] <= this.props.filterTime[1]));
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        selectedSections: state.selectedSections,
        isAdvanced: state.isAdvanced,
        askShowSingleCourse: state.askShowSingleCourse,
        showSingleCourse: state.showSingleCourse,
        singleCourseOrigin: state.singleCourseOrigin,
        filterTime: state.filterTime
    }
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
    }
}
